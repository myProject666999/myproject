package socket

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type Client struct {
	Hub      *Hub
	Conn     *websocket.Conn
	Send     chan []byte
	TicketId string
	UserId   int64
	Role     int
	Username string
	mu       sync.Mutex
}

type Hub struct {
	clients    map[string]map[*Client]bool
	broadcast  chan Message
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

type Message struct {
	Type      string `json:"type"`
	TicketId  string `json:"ticketId"`
	UserId    int64  `json:"userId"`
	Username  string `json:"username"`
	Role      int    `json:"role"`
	Content   string `json:"content"`
	Timestamp int64  `json:"timestamp"`
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[string]map[*Client]bool),
		broadcast:  make(chan Message),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if h.clients[client.TicketId] == nil {
				h.clients[client.TicketId] = make(map[*Client]bool)
			}
			h.clients[client.TicketId][client] = true
			h.mu.Unlock()
			log.Printf("Client connected to ticket %s: %s", client.TicketId, client.Username)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client.TicketId]; ok {
				if _, ok := h.clients[client.TicketId][client]; ok {
					delete(h.clients[client.TicketId], client)
					close(client.Send)
					if len(h.clients[client.TicketId]) == 0 {
						delete(h.clients, client.TicketId)
					}
				}
			}
			h.mu.Unlock()
			log.Printf("Client disconnected from ticket %s: %s", client.TicketId, client.Username)

		case message := <-h.broadcast:
			h.mu.RLock()
			clients := h.clients[message.TicketId]
			h.mu.RUnlock()

			msgJSON, _ := json.Marshal(message)
			for client := range clients {
				select {
				case client.Send <- msgJSON:
				default:
					h.mu.Lock()
					delete(h.clients[message.TicketId], client)
					close(client.Send)
					h.mu.Unlock()
				}
			}
		}
	}
}

func (c *Client) ReadPump() {
	defer func() {
		c.Hub.unregister <- c
		c.Conn.Close()
	}()

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}

		var msg Message
		if err := json.Unmarshal(message, &msg); err != nil {
			continue
		}

		msg.UserId = c.UserId
		msg.Username = c.Username
		msg.Role = c.Role
		msg.TicketId = c.TicketId

		c.Hub.broadcast <- msg
	}
}

func (c *Client) WritePump() {
	defer c.Conn.Close()

	for message := range c.Send {
		c.mu.Lock()
		c.Conn.WriteMessage(websocket.TextMessage, message)
		c.mu.Unlock()
	}
}

func HandleWebSocket(hub *Hub, w http.ResponseWriter, r *http.Request, ticketId string) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	userId := int64(0)
	username := "anonymous"
	role := 0

	client := &Client{
		Hub:      hub,
		Conn:     conn,
		Send:     make(chan []byte, 256),
		TicketId: ticketId,
		UserId:   userId,
		Username: username,
		Role:     role,
	}

	hub.register <- client

	go client.WritePump()
	go client.ReadPump()
}

func (h *Hub) BroadcastMessage(ticketId string, msg Message) {
	msg.TicketId = ticketId
	h.broadcast <- msg
}

func (h *Hub) PushNotification(ticketId string, notificationType string, content string) {
	msg := Message{
		Type:      notificationType,
		TicketId:  ticketId,
		Content:   content,
	}
	h.broadcast <- msg
}
