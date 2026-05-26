package websocket

import (
	"encoding/json"
	"log"
	"net/http"

	"barrage_interaction/config"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func HandleWebSocket(hub *Hub, c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	client := &Client{
		hub:  hub,
		conn: conn,
		send: make(chan []byte, 256),
	}

	client.hub.register <- client

	go client.WritePump()
	go client.ReadPump()

	go subscribeRedis(hub)
}

func subscribeRedis(hub *Hub) {
	if hub.redisClient == nil {
		return
	}

	pubsub := hub.redisClient.Subscribe(config.Ctx, config.AppConfig.Redis.Channel)
	defer pubsub.Close()

	ch := pubsub.Channel()
	for msg := range ch {
		var data interface{}
		json.Unmarshal([]byte(msg.Payload), &data)

		hub.BroadcastMessage("new_message", data)
	}
}

func SendSystemMessage(hub *Hub, msgType string, data interface{}) {
	hub.BroadcastMessage(msgType, data)
}
