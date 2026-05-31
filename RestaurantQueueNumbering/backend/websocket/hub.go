package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"restaurant-queue/config"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type Client struct {
	ID           string
	RestaurantID uint64
	UserID       uint64
	Conn         *websocket.Conn
	Send         chan []byte
	Hub          *Hub
}

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

type Message struct {
	Type    string      `json:"type"`
	Data    interface{} `json:"data"`
	RestaurantID uint64    `json:"restaurant_id"`
	UserID   uint64    `json:"user_id"`
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return !config.AppConfig.WebSocket.CheckOrigin
	},
}

func NewHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.Send)
			}
			h.mu.Unlock()
		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) Broadcast(msg *Message) {
	data, _ := json.Marshal(msg)
	h.broadcast <- data
}

func (h *Hub) SendToRestaurant(restaurantID uint64, msg *Message) {
	msg.RestaurantID = restaurantID
	data, _ := json.Marshal(msg)

	h.mu.RLock()
	defer h.mu.RUnlock()
	for client := range h.clients {
		if client.RestaurantID == restaurantID {
			select {
			case client.Send <- data:
			default:
			}
		}
	}
}

func (h *Hub) SendToUser(userID uint64, msg *Message) {
	msg.UserID = userID
	data, _ := json.Marshal(msg)

	h.mu.RLock()
	defer h.mu.RUnlock()
	for client := range h.clients {
		if client.UserID == userID {
			select {
			case client.Send <- data:
			default:
			}
		}
	}
}

func (c *Client) readPump() {
	defer func() {
		c.Hub.unregister <- c
		c.Conn.Close()
	}()

	for {
		_, _, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
	}
}

func (c *Client) writePump() {
	defer c.Conn.Close()

	for message := range c.Send {
		c.Conn.WriteMessage(websocket.TextMessage, message)
	}
}

var WsHub *Hub

func InitWebSocket() {
	WsHub = NewHub()
	go WsHub.Run()
}

func HandleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := &Client{
		Conn: conn,
		Send: make(chan []byte, 256),
		Hub:  WsHub,
	}

	WsHub.register <- client

	go client.writePump()
	go client.readPump()
}
