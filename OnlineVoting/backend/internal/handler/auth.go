package handler

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/mojocn/base64Captcha"

	"online-voting/internal/redis"
)

var captchaStore = base64Captcha.DefaultMemStore

type CaptchaResp struct {
	CaptchaID string `json:"captcha_id"`
	Image     string `json:"image"`
}

func GetCaptcha(c *fiber.Ctx) error {
	driver := base64Captcha.NewDriverDigit(80, 240, 4, 0.7, 80)
	cp := base64Captcha.NewCaptcha(driver, captchaStore)
	id, b64s, err := cp.Generate()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"code": 500, "message": "生成验证码失败"})
	}
	return c.JSON(fiber.Map{"code": 0, "message": "success", "data": CaptchaResp{CaptchaID: id, Image: b64s}})
}

func VerifyCaptcha(id, answer string) bool {
	return captchaStore.Verify(id, answer, true)
}

type LoginReq struct {
	Username    string `json:"username"`
	Password    string `json:"password"`
	CaptchaID   string `json:"captcha_id"`
	CaptchaCode string `json:"captcha_code"`
}

func Login(c *fiber.Ctx) error {
	var req LoginReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "参数错误"})
	}
	if !captchaStore.Verify(req.CaptchaID, req.CaptchaCode, true) {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": "验证码错误"})
	}

	token, user, err := doLogin(req.Username, req.Password)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"code": 400, "message": err.Error()})
	}

	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    token,
		Expires:  time.Now().Add(24 * time.Hour),
		HTTPOnly: false,
		SameSite: "Lax",
	})

	return c.JSON(fiber.Map{
		"code":    0,
		"message": "success",
		"data": fiber.Map{
			"token": token,
			"user": fiber.Map{
				"id":       user.ID,
				"username": user.Username,
				"role":     user.Role,
			},
		},
	})
}

func Logout(c *fiber.Ctx) error {
	c.Cookie(&fiber.Cookie{Name: "token", Value: "", Expires: time.Now()})
	return c.JSON(fiber.Map{"code": 0, "message": "success"})
}

func CurrentUser(c *fiber.Ctx) error {
	uid := c.Locals("user_id")
	uname := c.Locals("username")
	role := c.Locals("role")
	if uid == nil {
		return c.JSON(fiber.Map{"code": 0, "message": "success", "data": nil})
	}
	return c.JSON(fiber.Map{
		"code":    0,
		"message": "success",
		"data": fiber.Map{
			"id":       uid,
			"username": uname,
			"role":     role,
		},
	})
}

// 缓存预热标记
func HealthCheck(c *fiber.Ctx) error {
	status := fiber.Map{"app": "ok", "db": "ok", "redis": "ok"}
	if redis.Client == nil || redis.Client.Ping(redis.Ctx).Err() != nil {
		status["redis"] = "disconnected"
	}
	return c.JSON(fiber.Map{"code": 0, "message": "success", "data": status})
}
