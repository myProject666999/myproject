package handlers

import (
	"minimalist-block-browser/web3"
	"time"

	"github.com/gin-gonic/gin"
)

func (h *Handler) GetTransaction(c *gin.Context) {
	start := time.Now()
	txHash := c.Param("hash")

	cacheKey := "tx:" + txHash

	var cachedTx web3.TransactionResult
	if h.cacheGet(cacheKey, &cachedTx) {
		h.logQuery("transaction", txHash, "cache", start, c)
		h.respond(c, cachedTx, "cache", nil)
		return
	}

	tx, err := h.rpc.GetTransactionByHash(txHash)
	if err != nil {
		h.mockGetTransaction(c, txHash, start)
		return
	}

	receipt, err := h.rpc.GetTransactionReceipt(txHash)
	if err != nil {
		h.mockGetTransaction(c, txHash, start)
		return
	}

	result := gin.H{
		"transaction": tx,
		"receipt":     receipt,
	}

	h.cacheSet(cacheKey, tx, h.cfg.Cache.TransactionTTL)
	h.logQuery("transaction", txHash, "rpc", start, c)
	h.respond(c, result, "rpc", nil)
}