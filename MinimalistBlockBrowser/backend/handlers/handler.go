package handlers

import (
	"encoding/json"
	"minimalist-block-browser/cache"
	"minimalist-block-browser/config"
	"minimalist-block-browser/database"
	"minimalist-block-browser/web3"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	cfg    *config.Config
	cache  *cache.Cache
	rpc    *web3.RPCClient
}

func NewHandler(cfg *config.Config, rpcClient *web3.RPCClient) *Handler {
	return &Handler{
		cfg:   cfg,
		cache: cache.GetInstance(),
		rpc:   rpcClient,
	}
}

type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Source  string      `json:"source,omitempty"`
	Time    int64       `json:"time"`
}

func (h *Handler) respond(c *gin.Context, data interface{}, source string, err error) {
	start := time.Now()
	resp := APIResponse{
		Success: err == nil,
		Data:    data,
		Source:  source,
		Time:    start.UnixMilli(),
	}
	if err != nil {
		resp.Error = err.Error()
		c.JSON(http.StatusInternalServerError, resp)
	} else {
		c.JSON(http.StatusOK, resp)
	}
}

func (h *Handler) respondError(c *gin.Context, statusCode int, errMsg string) {
	c.JSON(statusCode, APIResponse{
		Success: false,
		Error:   errMsg,
		Time:    time.Now().UnixMilli(),
	})
}

func (h *Handler) logQuery(queryType, queryValue, source string, start time.Time, c *gin.Context) {
	elapsed := time.Since(start).Milliseconds()
	ip := c.ClientIP()
	ua := c.GetHeader("User-Agent")
	database.RecordQueryLog(queryType, queryValue, source, int(elapsed), ip, ua)
}

func (h *Handler) cacheSet(key string, value interface{}, ttl time.Duration) {
	data, err := json.Marshal(value)
	if err == nil {
		h.cache.Set(key, data, ttl)
	}
}

func (h *Handler) cacheGet(key string, target interface{}) bool {
	raw, found := h.cache.Get(key)
	if !found {
		return false
	}
	data, ok := raw.([]byte)
	if !ok {
		return false
	}
	return json.Unmarshal(data, target) == nil
}