package route

import (
	"time"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"

	"online-voting/internal/handler"
	"online-voting/internal/middleware"
)

func Register(app *fiber.App) {
	api := app.Group("/api")

	// 公共接口
	api.Get("/health", handler.HealthCheck)
	api.Get("/captcha", middleware.RateLimit("captcha", 5, time.Minute), handler.GetCaptcha)
	api.Post("/login", middleware.RateLimit("login", 3, time.Minute), handler.Login)
	api.Post("/logout", handler.Logout)
	api.Get("/me", middleware.OptionalAuth, handler.CurrentUser)

	// 活动公开
	api.Get("/activities", handler.ListActivities)
	api.Get("/activities/:id", handler.GetActivity)
	api.Get("/activities/:id/result", handler.GetVoteResult)
	api.Get("/activities/:id/lottery-records", handler.LotteryRecords)
	api.Get("/activities/:id/vote-records", handler.VoteRecords)

	// 投票 / 抽奖（需登录或游客）
	api.Post("/vote",
		middleware.OptionalAuth,
		middleware.RateLimit("vote", 10, time.Minute),
		handler.Vote,
	)
	api.Post("/lottery/:id",
		middleware.OptionalAuth,
		middleware.RateLimit("lottery", 5, time.Minute),
		handler.LotteryDraw,
	)

	// 管理端
	admin := api.Group("/admin", middleware.AuthRequired, middleware.AdminRequired)
	admin.Post("/activities", handler.CreateActivity)
	admin.Put("/activities/:id", handler.UpdateActivity)
	admin.Delete("/activities/:id", handler.DeleteActivity)

	// WebSocket
	app.Get("/ws", websocket.New(handler.WebsocketHandler))
}
