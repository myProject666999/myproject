package ws

import (
	"encoding/json"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 512
)

type Client struct {
	ID     uint
	Conn   *websocket.Conn
	Send   chan []byte
	RoomID uint
	UserID uint
}

type Hub struct {
	Clients    map[uint]*Client
	Register   chan *Client
	Unregister chan *Client
	Broadcast  chan Message
	Rooms      map[uint]map[uint]*Client
	mu         sync.RWMutex
}

type Message struct {
	Type   string      `json:"type"`
	From   uint        `json:"from,omitempty"`
	To     uint        `json:"to,omitempty"`
	RoomID uint        `json:"room_id,omitempty"`
	Data   interface{} `json:"data,omitempty"`
}

func NewHub() *Hub {
	return &Hub{
		Clients:    make(map[uint]*Client),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan Message),
		Rooms:      make(map[uint]map[uint]*Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			h.Clients[client.UserID] = client
			if client.RoomID > 0 {
				if _, ok := h.Rooms[client.RoomID]; !ok {
					h.Rooms[client.RoomID] = make(map[uint]*Client)
				}
				h.Rooms[client.RoomID][client.UserID] = client
			}
			h.mu.Unlock()
		case client := <-h.Unregister:
			h.mu.Lock()
			if _, ok := h.Clients[client.UserID]; ok {
				delete(h.Clients, client.UserID)
				if client.RoomID > 0 {
					if room, ok := h.Rooms[client.RoomID]; ok {
						delete(room, client.UserID)
						if len(room) == 0 {
							delete(h.Rooms, client.RoomID)
						}
					}
				}
				close(client.Send)
			}
			h.mu.Unlock()
		case message := <-h.Broadcast:
			h.mu.RLock()
			switch message.Type {
			case "broadcast":
				for _, client := range h.Clients {
					h.sendToClient(client, message)
				}
			case "room":
				if room, ok := h.Rooms[message.RoomID]; ok {
					for _, client := range room {
						h.sendToClient(client, message)
					}
				}
			case "private":
				if client, ok := h.Clients[message.To]; ok {
					h.sendToClient(client, message)
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) BroadcastToRoom(roomID uint, data interface{}) {
	msg := Message{
		Type:   "room",
		RoomID: roomID,
		Data:   data,
	}
	h.Broadcast <- msg
}

func (h *Hub) sendToClient(client *Client, message Message) {
	data, err := json.Marshal(message)
	if err != nil {
		return
	}
	select {
	case client.Send <- data:
	default:
	}
}

func (c *Client) ReadPump(hub *Hub) {
	defer func() {
		hub.Unregister <- c
		c.Conn.Close()
	}()
	c.Conn.SetReadLimit(maxMessageSize)
	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})
	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
			}
			break
		}
		var msg Message
		if err := json.Unmarshal(message, &msg); err != nil {
			continue
		}
		if msg.Type == "ping" {
			pongMsg := Message{Type: "pong"}
			data, _ := json.Marshal(pongMsg)
			select {
			case c.Send <- data:
			default:
			}
			continue
		}
		msg.From = c.UserID
		hub.Broadcast <- msg
	}
}

func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			c.Conn.WriteMessage(websocket.TextMessage, message)
		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
