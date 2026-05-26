package websocket

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"simple-chat-room/models"
)

type BroadcastMessage struct {
	roomID      string
	nickname    string
	content     string
	imageURL    string
	messageType int
}

type Hub struct {
	rooms       map[string]map[*Client]bool
	broadcast   chan *BroadcastMessage
	register    chan *Client
	unregister  chan *Client
	mu          sync.RWMutex
	upgrader    websocket.Upgrader
}

func NewHub() *Hub {
	return &Hub{
		rooms:      make(map[string]map[*Client]bool),
		broadcast:  make(chan *BroadcastMessage),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if _, ok := h.rooms[client.roomID]; !ok {
				h.rooms[client.roomID] = make(map[*Client]bool)
			}
			h.rooms[client.roomID][client] = true
			h.mu.Unlock()

			h.sendSystemMessage(client.roomID, "join", fmt.Sprintf("%s joined the room", client.nickname))

		case client := <-h.unregister:
			h.mu.Lock()
			if room, ok := h.rooms[client.roomID]; ok {
				if _, ok := room[client]; ok {
					delete(room, client)
					close(client.send)
					if len(room) == 0 {
						delete(h.rooms, client.roomID)
					}
				}
			}
			h.mu.Unlock()

			h.sendSystemMessage(client.roomID, "leave", fmt.Sprintf("%s left the room", client.nickname))

		case msg := <-h.broadcast:
			h.handleBroadcast(msg)
		}
	}
}

func (h *Hub) handleBroadcast(msg *BroadcastMessage) {
	savedMsg, err := models.CreateMessage(msg.roomID, msg.nickname, msg.content, msg.imageURL, msg.messageType)
	if err != nil {
		h.logError(fmt.Errorf("failed to save message: %w", err))
		return
	}

	outMsg := OutgoingMessage{
		ID:          savedMsg.ID,
		RoomID:      savedMsg.RoomID,
		Nickname:    savedMsg.Nickname,
		Content:     savedMsg.Content,
		ImageURL:    savedMsg.ImageURL,
		MessageType: savedMsg.MessageType,
		CreatedAt:   savedMsg.CreatedAt.Format(time.RFC3339),
	}

	data, err := json.Marshal(outMsg)
	if err != nil {
		h.logError(err)
		return
	}

	h.mu.RLock()
	room, ok := h.rooms[msg.roomID]
	if !ok {
		h.mu.RUnlock()
		return
	}

	for client := range room {
		select {
		case client.send <- data:
		default:
			close(client.send)
			delete(room, client)
		}
	}
	h.mu.RUnlock()
}

func (h *Hub) sendSystemMessage(roomID, msgType, message string) {
	sysMsg := SystemMessage{
		Type:    msgType,
		Message: message,
	}

	data, err := json.Marshal(sysMsg)
	if err != nil {
		h.logError(err)
		return
	}

	h.mu.RLock()
	room, ok := h.rooms[roomID]
	if !ok {
		h.mu.RUnlock()
		return
	}

	for client := range room {
		select {
		case client.send <- data:
		default:
			close(client.send)
			delete(room, client)
		}
	}
	h.mu.RUnlock()
}

func (h *Hub) HandleWebSocket(c *gin.Context) {
	roomID := c.Param("roomId")
	nickname := c.Query("nickname")

	if nickname == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nickname is required"})
		return
	}

	active, err := models.IsRoomActive(roomID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		return
	}

	if !active {
		c.JSON(http.StatusGone, gin.H{"error": "Room is no longer active"})
		return
	}

	conn, err := h.upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		h.logError(err)
		return
	}

	client := &Client{
		hub:      h,
		conn:     conn,
		send:     make(chan []byte, 256),
		roomID:   roomID,
		nickname: nickname,
	}

	h.register <- client

	go client.writePump()
	go client.readPump()
}

func (h *Hub) logError(err error) {
	log.Printf("WebSocket error: %v", err)
}

func (h *Hub) GetRoomCount(roomID string) int {
	h.mu.RLock()
	defer h.mu.RUnlock()

	if room, ok := h.rooms[roomID]; ok {
		return len(room)
	}
	return 0
}
