package handler

import (
	"log"

	"github.com/gofiber/contrib/websocket"

	"online-voting/internal/hub"
)

func WebsocketHandler(c *websocket.Conn) {
	channel := c.Query("channel", "all")
	log.Printf("websocket connected: channel=%s", channel)

	hub.H.Register(c, channel)
	defer func() {
		hub.H.Unregister(c)
		c.Close()
	}()

	for {
		_, _, err := c.ReadMessage()
		if err != nil {
			break
		}
	}
}
