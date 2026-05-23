package hub

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gofiber/contrib/websocket"
)

type Message struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

type Hub struct {
	clients map[*websocket.Conn]string
	mu      sync.RWMutex
}

var H = &Hub{
	clients: make(map[*websocket.Conn]string),
}

func (h *Hub) Register(conn *websocket.Conn, channel string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[conn] = channel
}

func (h *Hub) Unregister(conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.clients, conn)
}

func (h *Hub) Broadcast(channel string, msg Message) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	payload, err := json.Marshal(msg)
	if err != nil {
		return
	}

	for conn, ch := range h.clients {
		if ch == channel || ch == "all" {
			if err := conn.WriteMessage(websocket.TextMessage, payload); err != nil {
				log.Printf("websocket write error: %v", err)
			}
		}
	}
}

func (h *Hub) BroadcastAll(msg Message) {
	h.Broadcast("all", msg)
}
