package handlers

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"group-buying/config"
	"group-buying/models"
	"group-buying/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CreateGroupRequest struct {
	ProductID  uint    `json:"product_id" binding:"required"`
	Title      string  `json:"title" binding:"required"`
	GroupPrice float64 `json:"group_price" binding:"required"`
	GroupSize  int     `json:"group_size" binding:"required,min=2"`
	Duration   int     `json:"duration"`
}

type GroupDetailResponse struct {
	ID           uint              `json:"id"`
	ProductID    uint              `json:"product_id"`
	Product      ProductResponse   `json:"product"`
	InitiatorID  uint              `json:"initiator_id"`
	Initiator    UserResponse      `json:"initiator"`
	Title        string            `json:"title"`
	GroupPrice   float64           `json:"group_price"`
	GroupSize    int               `json:"group_size"`
	CurrentSize  int               `json:"current_size"`
	Status       int               `json:"status"`
	ExpireTime   time.Time         `json:"expire_time"`
	CreatedAt    time.Time         `json:"created_at"`
	Participants []ParticipantResp `json:"participants"`
	Progress     float64           `json:"progress"`
	CanJoin      bool              `json:"can_join"`
}

type ParticipantResp struct {
	ID       uint   `json:"id"`
	UserID   uint   `json:"user_id"`
	Nickname string `json:"nickname"`
	Avatar   string `json:"avatar"`
	JoinType int    `json:"join_type"`
	Status   int    `json:"status"`
	JoinedAt string `json:"joined_at"`
}

type GroupListResponse struct {
	ID          uint            `json:"id"`
	ProductID   uint            `json:"product_id"`
	Product     ProductResponse `json:"product"`
	InitiatorID uint            `json:"initiator_id"`
	Initiator   UserResponse    `json:"initiator"`
	Title       string          `json:"title"`
	GroupPrice  float64         `json:"group_price"`
	GroupSize   int             `json:"group_size"`
	CurrentSize int             `json:"current_size"`
	Status      int             `json:"status"`
	ExpireTime  time.Time       `json:"expire_time"`
	CreatedAt   time.Time       `json:"created_at"`
	Progress    float64         `json:"progress"`
}

func CreateGroup(c *gin.Context) {
	userID := c.GetUint("user_id")
	var req CreateGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, "参数错误: "+err.Error())
		return
	}
	var product models.Product
	if err := config.DB.First(&product, req.ProductID).Error; err != nil {
		utils.Fail(c, 404, "商品不存在")
		return
	}
	if product.Stock <= 0 {
		utils.Fail(c, 400, "商品库存不足")
		return
	}
	if req.GroupPrice <= 0 {
		utils.Fail(c, 400, "拼团价格必须大于0")
		return
	}
	duration := req.Duration
	if duration <= 0 {
		duration = 24
	}
	group := models.GroupBuying{
		ProductID:   req.ProductID,
		InitiatorID: userID,
		Title:       req.Title,
		GroupPrice:  req.GroupPrice,
		GroupSize:   req.GroupSize,
		CurrentSize: 1,
		Status:      0,
		ExpireTime:  time.Now().Add(time.Duration(duration) * time.Hour),
	}
	err := config.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&group).Error; err != nil {
			return fmt.Errorf("创建拼团失败: %w", err)
		}
		participant := models.GroupParticipant{
			GroupID:  group.ID,
			UserID:   userID,
			OrderID:  0,
			JoinType: 2,
			Status:   0,
		}
		if err := tx.Create(&participant).Error; err != nil {
			return fmt.Errorf("创建参团记录失败: %w", err)
		}
		return nil
	})
	if err != nil {
		utils.Fail(c, 500, err.Error())
		return
	}
	utils.Success(c, gin.H{"group_id": group.ID})
}

func JoinGroup(c *gin.Context) {
	userID := c.GetUint("user_id")
	groupIDStr := c.Param("id")
	groupID, _ := strconv.ParseUint(groupIDStr, 10, 64)
	var group models.GroupBuying
	if err := config.DB.First(&group, groupID).Error; err != nil {
		utils.Fail(c, 404, "拼团不存在")
		return
	}
	if group.Status != 0 {
		utils.Fail(c, 400, "拼团已结束")
		return
	}
	if time.Now().After(group.ExpireTime) {
		utils.Fail(c, 400, "拼团已过期")
		return
	}
	var existingParticipant models.GroupParticipant
	if config.DB.Where("group_id = ? AND user_id = ?", group.ID, userID).First(&existingParticipant).Error == nil {
		utils.Fail(c, 400, "您已经参与该拼团")
		return
	}
	var product models.Product
	if err := config.DB.First(&product, group.ProductID).Error; err != nil {
		utils.Fail(c, 404, "商品不存在")
		return
	}
	lockKey := fmt.Sprintf("group_join_lock:%d", group.ID)
	locked, err := config.RDB.SetNX(config.Ctx, lockKey, 1, 3*time.Second).Result()
	if err != nil {
		utils.Fail(c, 500, "系统错误")
		return
	}
	if !locked {
		utils.Fail(c, 429, "操作太频繁，请稍后再试")
		return
	}
	defer config.RDB.Del(config.Ctx, lockKey)
	var order models.Order
	err = config.DB.Transaction(func(tx *gorm.DB) error {
		var user models.User
		if err := tx.First(&user, userID).Error; err != nil {
			return fmt.Errorf("用户不存在")
		}
		if user.Balance < group.GroupPrice {
			return fmt.Errorf("余额不足，请先充值")
		}
		if group.CurrentSize >= group.GroupSize {
			return fmt.Errorf("拼团已满")
		}
		order = models.Order{
			OrderNo:      utils.GenerateOrderNo(uint(userID)),
			UserID:       uint(userID),
			GroupID:      group.ID,
			ProductID:    group.ProductID,
			ProductName:  product.Name,
			ProductImage: product.Images,
			UnitPrice:    group.GroupPrice,
			Quantity:     1,
			TotalAmount:  group.GroupPrice,
			PayAmount:    group.GroupPrice,
			Status:       1,
		}
		now := time.Now()
		order.PayTime = &now
		if err := tx.Create(&order).Error; err != nil {
			return fmt.Errorf("创建订单失败")
		}
		participant := models.GroupParticipant{
			GroupID:  group.ID,
			UserID:   uint(userID),
			OrderID:  order.ID,
			JoinType: 1,
			Status:   1,
		}
		if err := tx.Create(&participant).Error; err != nil {
			return fmt.Errorf("参与拼团失败")
		}
		if err := tx.Model(&user).Update("balance", user.Balance-group.GroupPrice).Error; err != nil {
			return fmt.Errorf("扣款失败")
		}
		result := tx.Model(&models.GroupBuying{}).
			Where("id = ? AND current_size < ?", group.ID, group.GroupSize).
			UpdateColumn("current_size", gorm.Expr("current_size + 1"))
		if result.Error != nil {
			return fmt.Errorf("更新拼团进度失败")
		}
		if result.RowsAffected == 0 {
			return fmt.Errorf("拼团已满")
		}
		return nil
	})
	if err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	var updatedGroup models.GroupBuying
	config.DB.First(&updatedGroup, group.ID)
	if updatedGroup.CurrentSize >= updatedGroup.GroupSize {
		config.DB.Model(&updatedGroup).Update("status", 1)
		config.DB.Model(&models.Product{}).Where("id = ?", group.ProductID).UpdateColumn("stock", gorm.Expr("stock - 1"))
	}
	utils.Success(c, gin.H{
		"order_id":     order.ID,
		"current_size": updatedGroup.CurrentSize,
		"group_size":   updatedGroup.GroupSize,
		"success":      updatedGroup.CurrentSize >= updatedGroup.GroupSize,
	})
}

func GetGroupDetail(c *gin.Context) {
	id := c.Param("id")
	var group models.GroupBuying
	if err := config.DB.First(&group, id).Error; err != nil {
		utils.Fail(c, 404, "拼团不存在")
		return
	}
	var product models.Product
	config.DB.First(&product, group.ProductID)
	var initiator models.User
	config.DB.First(&initiator, group.InitiatorID)
	var participants []models.GroupParticipant
	config.DB.Where("group_id = ?", group.ID).Find(&participants)
	var participantResp []ParticipantResp
	for _, p := range participants {
		var u models.User
		config.DB.First(&u, p.UserID)
		participantResp = append(participantResp, ParticipantResp{
			ID:       p.ID,
			UserID:   p.UserID,
			Nickname: u.Nickname,
			Avatar:   u.Avatar,
			JoinType: p.JoinType,
			Status:   p.Status,
			JoinedAt: p.JoinedAt.Format("2006-01-02 15:04:05"),
		})
	}
	progress := float64(group.CurrentSize) / float64(group.GroupSize) * 100
	canJoin := group.Status == 0 && time.Now().Before(group.ExpireTime) && group.CurrentSize < group.GroupSize
	utils.Success(c, GroupDetailResponse{
		ID:          group.ID,
		ProductID:   group.ProductID,
		Product:     ProductResponse{ID: product.ID, Name: product.Name, Description: product.Description, Images: product.Images, OriginalPrice: product.OriginalPrice, Stock: product.Stock},
		InitiatorID: group.InitiatorID,
		Initiator:   UserResponse{ID: initiator.ID, Username: initiator.Username, Nickname: initiator.Nickname, Avatar: initiator.Avatar},
		Title:       group.Title,
		GroupPrice:  group.GroupPrice,
		GroupSize:   group.GroupSize,
		CurrentSize: group.CurrentSize,
		Status:      group.Status,
		ExpireTime:  group.ExpireTime,
		CreatedAt:   group.CreatedAt,
		Participants: participantResp,
		Progress:    progress,
		CanJoin:     canJoin,
	})
}

func GetGroupList(c *gin.Context) {
	status := c.Query("status")
	var groups []models.GroupBuying
	query := config.DB
	if status != "" {
		query = query.Where("status = ?", status)
	} else {
		query = query.Where("status IN ?", []int{0, 1})
	}
	query.Order("id DESC").Limit(50).Find(&groups)
	var resp []GroupListResponse
	for _, g := range groups {
		var product models.Product
		config.DB.First(&product, g.ProductID)
		var initiator models.User
		config.DB.First(&initiator, g.InitiatorID)
		progress := float64(g.CurrentSize) / float64(g.GroupSize) * 100
		resp = append(resp, GroupListResponse{
			ID:          g.ID,
			ProductID:   g.ProductID,
			Product:     ProductResponse{ID: product.ID, Name: product.Name, Images: product.Images, OriginalPrice: product.OriginalPrice, Stock: product.Stock},
			InitiatorID: g.InitiatorID,
			Initiator:   UserResponse{ID: initiator.ID, Nickname: initiator.Nickname, Avatar: initiator.Avatar},
			Title:       g.Title,
			GroupPrice:  g.GroupPrice,
			GroupSize:   g.GroupSize,
			CurrentSize: g.CurrentSize,
			Status:      g.Status,
			ExpireTime:  g.ExpireTime,
			CreatedAt:   g.CreatedAt,
			Progress:    progress,
		})
	}
	utils.Success(c, resp)
}

func GetMyGroups(c *gin.Context) {
	userID := c.GetUint("user_id")
	var participants []models.GroupParticipant
	config.DB.Where("user_id = ?", userID).Order("id DESC").Find(&participants)
	var groupIDs []uint
	for _, p := range participants {
		groupIDs = append(groupIDs, p.GroupID)
	}
	if len(groupIDs) == 0 {
		utils.Success(c, []GroupListResponse{})
		return
	}
	var groups []models.GroupBuying
	config.DB.Where("id IN ?", groupIDs).Order("id DESC").Find(&groups)
	var resp []GroupListResponse
	for _, g := range groups {
		var product models.Product
		config.DB.First(&product, g.ProductID)
		progress := float64(g.CurrentSize) / float64(g.GroupSize) * 100
		resp = append(resp, GroupListResponse{
			ID:          g.ID,
			ProductID:   g.ProductID,
			Product:     ProductResponse{ID: product.ID, Name: product.Name, Images: product.Images, OriginalPrice: product.OriginalPrice},
			InitiatorID: g.InitiatorID,
			Title:       g.Title,
			GroupPrice:  g.GroupPrice,
			GroupSize:   g.GroupSize,
			CurrentSize: g.CurrentSize,
			Status:      g.Status,
			ExpireTime:  g.ExpireTime,
			CreatedAt:   g.CreatedAt,
			Progress:    progress,
		})
	}
	utils.Success(c, resp)
}

func CancelGroup(c *gin.Context) {
	groupIDStr := c.Param("id")
	groupID, _ := strconv.ParseUint(groupIDStr, 10, 64)
	var group models.GroupBuying
	if err := config.DB.First(&group, groupID).Error; err != nil {
		utils.Fail(c, 404, "拼团不存在")
		return
	}
	userID := c.GetUint("user_id")
	if group.InitiatorID != userID {
		utils.Fail(c, 403, "只有团长才能取消拼团")
		return
	}
	if group.Status != 0 {
		utils.Fail(c, 400, "拼团已结束，无法取消")
		return
	}
	refundGroupParticipants(group.ID)
	config.DB.Model(&group).Update("status", 3)
	utils.SuccessMsg(c, "取消成功，已退款")
}

func refundGroupParticipants(groupID uint) {
	var participants []models.GroupParticipant
	config.DB.Where("group_id = ? AND status = 1", groupID).Find(&participants)
	for _, p := range participants {
		if p.OrderID > 0 {
			var order models.Order
			config.DB.First(&order, p.OrderID)
			if order.Status == 1 {
				var user models.User
				config.DB.First(&user, p.UserID)
				config.DB.Model(&user).Update("balance", user.Balance+order.PayAmount)
				config.DB.Model(&order).Updates(map[string]interface{}{
					"status":      2,
					"refund_time": time.Now(),
				})
				refund := models.Refund{
					OrderID: order.ID,
					UserID:  p.UserID,
					GroupID: groupID,
					Amount:  order.PayAmount,
					Reason:  "拼团取消退款",
					Status:  1,
				}
				config.DB.Create(&refund)
				config.DB.Model(&p).Update("status", 2)
			}
		}
	}
}

func AdminGetGroups(c *gin.Context) {
	status := c.Query("status")
	var groups []models.GroupBuying
	query := config.DB
	if status != "" {
		query = query.Where("status = ?", status)
	}
	query.Order("id DESC").Find(&groups)
	utils.Success(c, groups)
}

func AdminDeleteGroup(c *gin.Context) {
	id := c.Param("id")
	var group models.GroupBuying
	if err := config.DB.First(&group, id).Error; err != nil {
		utils.Fail(c, 404, "拼团不存在")
		return
	}
	if group.Status == 0 {
		refundGroupParticipants(group.ID)
	}
	config.DB.Where("group_id = ?", id).Delete(&models.GroupParticipant{})
	config.DB.Delete(&group)
	utils.SuccessMsg(c, "删除成功")
}

func CheckExpireGroups() {
	ctx := context.Background()
	var expiredGroups []models.GroupBuying
	config.DB.Where("status = 0 AND expire_time < ?", time.Now()).Find(&expiredGroups)
	for _, group := range expiredGroups {
		if group.CurrentSize < group.GroupSize {
			refundGroupParticipants(group.ID)
			config.DB.Model(&group).Update("status", 2)
		}
	}
	_ = ctx
}
