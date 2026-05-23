package handler

import (
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"

	"online-voting/internal/database"
	"online-voting/internal/redis"
	"online-voting/internal/model"
)

type ListResp struct {
	Total int64          `json:"total"`
	Items []model.Activity `json:"items"`
}

func ListActivities(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	size, _ := strconv.Atoi(c.Query("size", "10"))
	typ := c.Query("type", "")
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 50 {
		size = 10
	}

	db := database.DB.Model(&model.Activity{})
	if typ != "" {
		db = db.Where("type = ?", typ)
	}

	var total int64
	db.Count(&total)

	var items []model.Activity
	offset := (page - 1) * size
	db.Order("id desc").Limit(size).Offset(offset).Find(&items)

	return c.JSON(fiber.Map{
		"code":    0,
		"message": "success",
		"data":    ListResp{Total: total, Items: items},
	})
}

func GetActivity(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "参数错误"})
	}
	var act model.Activity
	if err := database.DB.Preload("Options").First(&act, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"code": 404, "message": "活动不存在"})
	}
	return c.JSON(fiber.Map{"code": 0, "message": "success", "data": act})
}

type ActivityReq struct {
	Title       string        `json:"title"`
	Description string        `json:"description"`
	Type        int           `json:"type"`
	StartTime   time.Time     `json:"start_time"`
	EndTime     time.Time     `json:"end_time"`
	Options     []OptionInput `json:"options"`
}

type OptionInput struct {
	ID        uint   `json:"id"`
	Name      string `json:"name"`
	Image     string `json:"image"`
	SortOrder int    `json:"sort_order"`
}

func CreateActivity(c *fiber.Ctx) error {
	var req ActivityReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "参数错误"})
	}
	if req.Title == "" || len(req.Options) == 0 {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "标题和选项不能为空"})
	}
	if req.EndTime.Before(req.StartTime) {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "结束时间需晚于开始时间"})
	}

	uid, _ := c.Locals("user_id").(uint)
	act := model.Activity{
		Title:       req.Title,
		Description: req.Description,
		Type:        req.Type,
		StartTime:   req.StartTime,
		EndTime:     req.EndTime,
		Status:      1,
		CreatedBy:   uid,
	}
	for _, o := range req.Options {
		act.Options = append(act.Options, model.Option{
			Name:      o.Name,
			Image:     o.Image,
			SortOrder: o.SortOrder,
		})
	}
	if err := database.DB.Create(&act).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"code": 500, "message": "创建失败"})
	}
	if act.Type == 1 {
		WarmUpVoteCache(act.ID)
	}
	return c.JSON(fiber.Map{"code": 0, "message": "success", "data": act})
}

func UpdateActivity(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "参数错误"})
	}
	var act model.Activity
	if err := database.DB.First(&act, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"code": 404, "message": "活动不存在"})
	}

	var req ActivityReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "参数错误"})
	}

	act.Title = req.Title
	act.Description = req.Description
	act.StartTime = req.StartTime
	act.EndTime = req.EndTime

	if err := database.DB.Save(&act).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"code": 500, "message": "保存失败"})
	}
	return c.JSON(fiber.Map{"code": 0, "message": "success", "data": act})
}

func DeleteActivity(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "参数错误"})
	}
	database.DB.Where("activity_id = ?", id).Delete(&model.Option{})
	database.DB.Where("activity_id = ?", id).Delete(&model.VoteRecord{})
	database.DB.Where("activity_id = ?", id).Delete(&model.LotteryRecord{})
	if err := database.DB.Delete(&model.Activity{}, id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"code": 500, "message": "删除失败"})
	}
	return c.JSON(fiber.Map{"code": 0, "message": "success"})
}

// Redis 预热：将数据库中的票数同步到 Redis 缓存
func WarmUpVoteCache(actID uint) error {
	if redis.Client == nil {
		return nil
	}
	var opts []model.Option
	if err := database.DB.Where("activity_id = ?", actID).Find(&opts).Error; err != nil {
		return err
	}
	for _, o := range opts {
		key := "vote:" + strconv.FormatUint(uint64(actID), 10)
		redis.Client.HSet(redis.Ctx, key, strconv.FormatUint(uint64(o.ID), 10), o.VoteCount)
	}
	redis.Client.Expire(redis.Ctx, "vote:"+strconv.FormatUint(uint64(actID), 10), 24*time.Hour)
	return nil
}

// 定时任务：将 Redis 中的票数同步回数据库
func SyncVoteCountToDB() {
	if redis.Client == nil {
		return
	}
	var acts []model.Activity
	database.DB.Where("type = 1").Find(&acts)
	for _, a := range acts {
		key := "vote:" + strconv.FormatUint(uint64(a.ID), 10)
		m, err := redis.Client.HGetAll(redis.Ctx, key).Result()
		if err != nil || len(m) == 0 {
			continue
		}
		for oid, count := range m {
			database.DB.Model(&model.Option{}).Where("id = ?", oid).Update("vote_count", count)
		}
	}
}

func WarmUpAllActivities() {
	var acts []model.Activity
	database.DB.Where("type = 1 AND status = 1").Find(&acts)
	for _, a := range acts {
		_ = WarmUpVoteCache(a.ID)
	}
}
