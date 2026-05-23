package handler

import (
	"fmt"
	"math/rand"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"online-voting/internal/database"
	"online-voting/internal/hub"
	"online-voting/internal/model"
)

type VoteReq struct {
	ActivityID  uint   `json:"activity_id"`
	OptionIDs   []uint `json:"option_ids"`
	MultiSelect bool   `json:"multi_select"`
	CaptchaID   string `json:"captcha_id"`
	CaptchaCode string `json:"captcha_code"`
}

func Vote(c *fiber.Ctx) error {
	var req VoteReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "参数错误"})
	}
	if req.ActivityID == 0 || len(req.OptionIDs) == 0 {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "参数错误"})
	}
	if !req.MultiSelect && len(req.OptionIDs) > 1 {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "该活动为单选，只能选择一个选项"})
	}
	if !VerifyCaptcha(req.CaptchaID, req.CaptchaCode) {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "验证码错误"})
	}

	var act model.Activity
	if err := database.DB.First(&act, req.ActivityID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"code": 404, "message": "活动不存在"})
	}
	if act.Type != 1 {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "该活动不是投票活动"})
	}
	now := time.Now()
	if now.Before(act.StartTime) {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "活动尚未开始"})
	}
	if now.After(act.EndTime) {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "活动已结束"})
	}

	ip := c.IP()
	uid, _ := c.Locals("user_id").(uint)

	var existing int64
	if uid > 0 {
		database.DB.Model(&model.VoteRecord{}).
			Where("activity_id = ? AND user_id = ?", req.ActivityID, uid).
			Count(&existing)
	} else {
		database.DB.Model(&model.VoteRecord{}).
			Where("activity_id = ? AND user_ip = ?", req.ActivityID, ip).
			Count(&existing)
	}
	if existing > 0 {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "您已参与过本次投票"})
	}

	var options []model.Option
	database.DB.Where("id IN ? AND activity_id = ?", req.OptionIDs, req.ActivityID).Find(&options)
	if len(options) != len(req.OptionIDs) {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "选项无效"})
	}

	// Redis 原子计票 + DB 更新
	for _, oid := range req.OptionIDs {
		database.DB.Model(&model.Option{}).
			Where("id = ?", oid).
			UpdateColumn("vote_count", gorm.Expr("vote_count + ?", 1))
	}

	// 写入投票记录
	for _, oid := range req.OptionIDs {
		var userID *uint
		if uid > 0 {
			userID = &uid
		}
		rec := model.VoteRecord{
			ActivityID: req.ActivityID,
			OptionID:   oid,
			UserID:     userID,
			UserIP:     ip,
			UserAgent:  c.Get("User-Agent"),
		}
		database.DB.Create(&rec)
	}

	pushVoteResult(req.ActivityID)

	return c.JSON(fiber.Map{"code": 0, "message": "投票成功"})
}

func GetVoteResult(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "参数错误"})
	}
	var act model.Activity
	if err := database.DB.Preload("Options").First(&act, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"code": 404, "message": "活动不存在"})
	}

	total := 0
	for _, o := range act.Options {
		total += o.VoteCount
	}

	return c.JSON(fiber.Map{
		"code":    0,
		"message": "success",
		"data": fiber.Map{
			"activity":    act,
			"total_votes": total,
		},
	})
}

func pushVoteResult(actID uint) {
	var act model.Activity
	database.DB.Preload("Options").First(&act, actID)
	result := make(map[uint]int)
	for _, o := range act.Options {
		result[o.ID] = o.VoteCount
	}
	hub.H.Broadcast(fmt.Sprintf("vote:%d", actID), hub.Message{
		Type: "vote_update",
		Data: fiber.Map{
			"activity_id": actID,
			"votes":       result,
		},
	})
}

// ==================== 抽奖 ====================

func LotteryDraw(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "参数错误"})
	}

	var act model.Activity
	if err := database.DB.First(&act, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"code": 404, "message": "活动不存在"})
	}
	if act.Type != 2 {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "该活动不是抽奖活动"})
	}
	if act.Status == 0 {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "活动已结束"})
	}

	uid, _ := c.Locals("user_id").(uint)
	ip := c.IP()

	// 每人每天限抽 3 次
	today := time.Now().Format("2006-01-02")

	// 简化：直接用 DB 记录限制
	var count int64
	if uid > 0 {
		database.DB.Model(&model.LotteryRecord{}).
			Where("activity_id = ? AND user_id = ? AND DATE(created_at) = ?", id, uid, today).
			Count(&count)
	} else {
		database.DB.Model(&model.LotteryRecord{}).
			Where("activity_id = ? AND user_ip = ? AND DATE(created_at) = ?", id, ip, today).
			Count(&count)
	}
	if count >= 3 {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "今日抽奖次数已用完"})
	}

	var opts []model.Option
	database.DB.Where("activity_id = ?", id).Order("sort_order asc").Find(&opts)
	if len(opts) == 0 {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "奖品配置错误"})
	}

	// 按概率抽奖：最后一个通常是"谢谢参与"，概率高
	weights := make([]int, len(opts))
	for i := range opts {
		if i == len(opts)-1 {
			weights[i] = 70
		} else if i == len(opts)-2 {
			weights[i] = 20
		} else if i == len(opts)-3 {
			weights[i] = 8
		} else {
			weights[i] = 2
		}
	}
	total := 0
	for _, w := range weights {
		total += w
	}
	r := rand.Intn(total)
	acc := 0
	picked := opts[len(opts)-1]
	for i, w := range weights {
		acc += w
		if r < acc {
			picked = opts[i]
			break
		}
	}

	var userID *uint
	if uid > 0 {
		userID = &uid
	}
	rec := model.LotteryRecord{
		ActivityID: uint(id),
		OptionID:   picked.ID,
		UserID:     userID,
		UserIP:     ip,
	}
	database.DB.Create(&rec)

	return c.JSON(fiber.Map{
		"code":    0,
		"message": "success",
		"data": fiber.Map{
			"prize":  picked,
			"record": rec,
		},
	})
}

func LotteryRecords(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "参数错误"})
	}
	var records []model.LotteryRecord
	database.DB.Where("activity_id = ?", id).Order("id desc").Limit(50).Find(&records)
	return c.JSON(fiber.Map{"code": 0, "message": "success", "data": records})
}

func VoteRecords(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "参数错误"})
	}
	var records []model.VoteRecord
	database.DB.Where("activity_id = ?", id).Order("id desc").Limit(100).Find(&records)
	return c.JSON(fiber.Map{"code": 0, "message": "success", "data": records})
}
