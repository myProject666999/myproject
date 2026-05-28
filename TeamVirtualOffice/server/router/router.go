package router

import (
	"net/http"
	"strconv"
	"strings"
	"team-virtual-office/cache"
	"team-virtual-office/config"
	"team-virtual-office/handler"
	"team-virtual-office/ws"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

var upgrader = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}

func SetupRouter(db *gorm.DB, cacheMgr *cache.StatusManager, hub *ws.Hub, cfg *config.Config) *gin.Engine {
	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
		c.Header("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})

	handler.InitHandler(db, cacheMgr, hub, cfg)

	api := r.Group("/api")
	{
		api.POST("/user/login", handler.Login)
		api.POST("/user/register", handler.Register)
		api.GET("/ping", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "pong"})
		})
	}

	protected := api.Group("")
	protected.Use(JWTAuth(cfg))
	{
		user := protected.Group("/user")
		{
			user.GET("/info", handler.GetInfo)
			user.GET("/list", handler.ListUsers)
		}

		room := protected.Group("/room")
		{
			room.GET("/list", handler.ListRooms)
			room.POST("/create", handler.CreateRoom)
			room.POST("/join/:id", handler.JoinRoom)
			room.POST("/leave/:id", handler.LeaveRoom)
			room.GET("/:id", handler.GetRoomDetail)
			room.GET("/:id/seats", handler.ListSeats)
		}

		seat := protected.Group("/seat")
		{
			seat.POST("/occupy/:id", handler.OccupySeat)
			seat.POST("/leave/:id", handler.LeaveSeat)
		}

		status := protected.Group("/status")
		{
			status.POST("/update", handler.UpdateStatus)
			status.POST("/busy", handler.SetBusyMode)
			status.GET("/:id", handler.GetStatus)
			status.POST("/heartbeat", handler.Heartbeat)
		}

		call := protected.Group("/call")
		{
			call.POST("/start", handler.StartCall)
			call.POST("/answer/:id", handler.AnswerCall)
			call.POST("/reject/:id", handler.RejectCall)
			call.POST("/hangup/:id", handler.HangupCall)
		}

		message := protected.Group("/message")
		{
			message.POST("/room", handler.SendRoomMessage)
			message.POST("/private", handler.SendPrivateMessage)
			message.GET("/room/:id", handler.GetRoomMessages)
			message.GET("/private/:user_id", handler.GetPrivateMessages)
		}

		activity := protected.Group("/activity")
		{
			activity.GET("/list", handler.GetActivities)
		}
	}

	r.GET("/ws", func(c *gin.Context) {
		tokenString := c.Query("token")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
			return
		}

		claims := &jwt.RegisteredClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(cfg.JWT.Secret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		userIDStr := claims.Subject
		userID, _ := strconv.ParseUint(userIDStr, 10, 64)

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			return
		}

		client := &ws.Client{
			UserID: uint(userID),
			Conn:   conn,
			Send:   make(chan []byte, 256),
		}

		hub.Register <- client

		defer func() {
			hub.Unregister <- client
		}()

		go client.WritePump()
		client.ReadPump(hub)
	})

	return r
}

func JWTAuth(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(401, gin.H{"code": 401, "message": "missing authorization header"})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(401, gin.H{"code": 401, "message": "invalid authorization format"})
			c.Abort()
			return
		}

		tokenString := parts[1]
		claims := &jwt.RegisteredClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(cfg.JWT.Secret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(401, gin.H{"code": 401, "message": "invalid token"})
			c.Abort()
			return
		}

		userID := claims.Subject
		if userID == "" {
			c.JSON(401, gin.H{"code": 401, "message": "invalid token claims"})
			c.Abort()
			return
		}

		c.Set("user_id", userID)
		c.Next()
	}
}
