package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"

	"samecity-express/config"
	"samecity-express/internal/model"
	"samecity-express/pkg/utils"
)

type Client struct {
	Conn     *websocket.Conn
	UserID   uint
	RiderID  uint
	OrderID  uint
	Role     string
	Send     chan []byte
}

type Hub struct {
	Clients    map[*Client]bool
	Broadcast  chan []byte
	Register   chan *Client
	Unregister chan *Client
	Mutex      sync.RWMutex
}

var hub = &Hub{
	Broadcast:  make(chan []byte),
	Register:   make(chan *Client),
	Unregister: make(chan *Client),
	Clients:    make(map[*Client]bool),
}

func GetHub() *Hub {
	return hub
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.Mutex.Lock()
			h.Clients[client] = true
			h.Mutex.Unlock()
		case client := <-h.Unregister:
			h.Mutex.Lock()
			if _, ok := h.Clients[client]; ok {
				delete(h.Clients, client)
				close(client.Send)
			}
			h.Mutex.Unlock()
		case message := <-h.Broadcast:
			h.Mutex.RLock()
			for client := range h.Clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(h.Clients, client)
				}
			}
			h.Mutex.RUnlock()
		}
	}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Message struct {
	Type    string      `json:"type"`
	Content interface{} `json:"content"`
}

func HandleWebSocket(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		utils.Unauthorized(c, "未提供认证令牌")
		return
	}

	claims, err := utils.ParseToken(token)
	if err != nil {
		utils.Unauthorized(c, err.Error())
		return
	}

	orderIDStr := c.Query("order_id")
	var orderID uint
	if orderIDStr != "" {
		var oid uint64
		_, _ = sscanf(orderIDStr, "%d", &oid)
		orderID = uint(oid)
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}

	role := ""
	var userID uint
	var riderID uint
	if claims.UserID > 0 {
		role = "user"
		userID = claims.UserID
	}
	if claims.RiderID > 0 {
		role = "rider"
		riderID = claims.RiderID
	}

	client := &Client{
		Conn:    conn,
		UserID:  userID,
		RiderID: riderID,
		OrderID: orderID,
		Role:    role,
		Send:    make(chan []byte, 256),
	}

	hub.Register <- client

	go client.WritePump()
	go client.ReadPump()
}

func (c *Client) ReadPump() {
	defer func() {
		hub.Unregister <- c
		c.Conn.Close()
	}()

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		var msg Message
		if err := json.Unmarshal(message, &msg); err != nil {
			continue
		}

		switch msg.Type {
		case "location":
			if c.RiderID > 0 {
				locationData, ok := msg.Content.(map[string]interface{})
				if ok {
					longitude, _ := locationData["longitude"].(float64)
					latitude, _ := locationData["latitude"].(float64)

					config.DB.Model(&model.Rider{}).Where("id = ?", c.RiderID).Updates(map[string]interface{}{
						"longitude": longitude,
						"latitude":  latitude,
					})

					location := &model.RiderLocation{
						RiderID:   c.RiderID,
						Longitude: longitude,
						Latitude:  latitude,
					}
					config.DB.Create(location)

					broadcastMessage := Message{
						Type: "rider_location",
						Content: map[string]interface{}{
							"rider_id":  c.RiderID,
							"longitude": longitude,
							"latitude":  latitude,
						},
					}
					broadcastBytes, _ := json.Marshal(broadcastMessage)
					hub.Broadcast <- broadcastBytes
				}
			}
		case "order_status":
			broadcastMessage := Message{
				Type:    "order_status",
				Content: msg.Content,
			}
			broadcastBytes, _ := json.Marshal(broadcastMessage)
			hub.Broadcast <- broadcastBytes
		}
	}
}

func (c *Client) WritePump() {
	defer func() {
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			n := len(c.Send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.Send)
			}

			if err := w.Close(); err != nil {
				return
			}
		}
	}
}

func BroadcastNewOrder(order *model.Order) {
	message := Message{
		Type:    "new_order",
		Content: order,
	}
	bytes, _ := json.Marshal(message)
	hub.Broadcast <- bytes
}

func BroadcastOrderStatus(orderID uint, status int) {
	message := Message{
		Type: "order_status",
		Content: map[string]interface{}{
			"order_id": orderID,
			"status":   status,
		},
	}
	bytes, _ := json.Marshal(message)
	hub.Broadcast <- bytes
}

func sscanf(str string, format string, args ...interface{}) (int, error) {
	return 0, nil
}
