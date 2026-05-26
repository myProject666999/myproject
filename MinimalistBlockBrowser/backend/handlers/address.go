package handlers

import (
	"encoding/json"
	"time"

	"github.com/gin-gonic/gin"
)

func (h *Handler) GetAddress(c *gin.Context) {
	start := time.Now()
	address := c.Param("address")

	cacheKey := "address:" + address

	var cachedData map[string]interface{}
	if h.cacheGet(cacheKey, &cachedData) {
		h.logQuery("address", address, "cache", start, c)
		h.respond(c, cachedData, "cache", nil)
		return
	}

	balance, err := h.rpc.GetBalance(address)
	if err != nil {
		h.mockGetAddress(c, address, start)
		return
	}

	nonce, err := h.rpc.GetTransactionCount(address)
	if err != nil {
		h.mockGetAddress(c, address, start)
		return
	}

	code, err := h.rpc.GetCode(address)
	if err != nil {
		h.mockGetAddress(c, address, start)
		return
	}

	isContract := code != "0x"

	result := gin.H{
		"address":    address,
		"balance":    balance,
		"nonce":      nonce,
		"txCount":    nonce,
		"isContract": isContract,
	}

	if isContract {
		codeLen := (len(code) - 2) / 2
		result["codeSize"] = codeLen
	}

	h.cacheSet(cacheKey, result, h.cfg.Cache.AddressTTL)
	h.logQuery("address", address, "rpc", start, c)
	h.respond(c, result, "rpc", nil)
}

func (h *Handler) GetAddressTransactions(c *gin.Context) {
	start := time.Now()
	address := c.Param("address")

	cacheKey := "address:txs:" + address

	var cachedData interface{}
	if h.cacheGet(cacheKey, &cachedData) {
		h.logQuery("address_txs", address, "cache", start, c)
		h.respond(c, cachedData, "cache", nil)
		return
	}

	txCount, err := h.rpc.GetTransactionCount(address)
	if err != nil {
		h.mockGetAddress(c, address, start)
		return
	}

	balance, err := h.rpc.GetBalance(address)
	if err != nil {
		h.mockGetAddress(c, address, start)
		return
	}

	result := gin.H{
		"address": address,
		"balance": balance,
		"txCount": txCount,
		"transactions": []interface{}{},
	}

	data, _ := json.Marshal(result)
	h.cache.Set(cacheKey, data, h.cfg.Cache.AddressTTL)
	h.logQuery("address_txs", address, "rpc", start, c)
	h.respond(c, result, "rpc", nil)
}