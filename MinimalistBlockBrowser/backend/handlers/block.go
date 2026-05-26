package handlers

import (
	"minimalist-block-browser/web3"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func (h *Handler) GetBlockByNumber(c *gin.Context) {
	start := time.Now()
	param := c.Param("number")

	blockNum, err := strconv.ParseUint(param, 10, 64)
	if err != nil {
		h.respondError(c, http.StatusBadRequest, "invalid block number")
		return
	}

	cacheKey := "block:num:" + strconv.FormatUint(blockNum, 10)

	var cachedBlock web3.BlockResult
	if h.cacheGet(cacheKey, &cachedBlock) {
		h.logQuery("block", param, "cache", start, c)
		h.respond(c, cachedBlock, "cache", nil)
		return
	}

	block, err := h.rpc.GetBlockByNumber(blockNum)
	if err != nil {
		h.mockGetBlockByNumber(c, blockNum, start)
		return
	}

	h.cacheSet(cacheKey, block, h.cfg.Cache.BlockTTL)
	h.logQuery("block", param, "rpc", start, c)
	h.respond(c, block, "rpc", nil)
}

func (h *Handler) GetBlockByHash(c *gin.Context) {
	start := time.Now()
	hash := c.Param("hash")

	cacheKey := "block:hash:" + hash

	var cachedBlock web3.BlockResult
	if h.cacheGet(cacheKey, &cachedBlock) {
		h.logQuery("block", hash, "cache", start, c)
		h.respond(c, cachedBlock, "cache", nil)
		return
	}

	block, err := h.rpc.GetBlockByHash(hash)
	if err != nil {
		h.mockGetBlockByNumber(c, 20000000, start)
		return
	}

	h.cacheSet(cacheKey, block, h.cfg.Cache.BlockTTL)
	if block.Number != "" {
		h.cacheSet("block:num:"+block.Number, block, h.cfg.Cache.BlockTTL)
	}
	h.logQuery("block", hash, "rpc", start, c)
	h.respond(c, block, "rpc", nil)
}

func (h *Handler) GetLatestBlock(c *gin.Context) {
	start := time.Now()

	blockNum, err := h.rpc.GetBlockNumber()
	if err != nil {
		h.mockGetBlockByNumber(c, 20000000, start)
		return
	}

	cacheKey := "block:num:" + strconv.FormatUint(blockNum, 10)

	var cachedBlock web3.BlockResult
	if h.cacheGet(cacheKey, &cachedBlock) {
		h.logQuery("block", "latest", "cache", start, c)
		h.respond(c, cachedBlock, "cache", nil)
		return
	}

	block, err := h.rpc.GetBlockByNumber(blockNum)
	if err != nil {
		h.mockGetBlockByNumber(c, 20000000, start)
		return
	}

	h.cacheSet(cacheKey, block, h.cfg.Cache.BlockTTL)
	h.logQuery("block", "latest", "rpc", start, c)
	h.respond(c, block, "rpc", nil)
}

func (h *Handler) GetRecentBlocks(c *gin.Context) {
	start := time.Now()
	count := 10
	if countParam := c.Query("count"); countParam != "" {
		if n, err := strconv.Atoi(countParam); err == nil && n > 0 && n <= 20 {
			count = n
		}
	}

	latestBlock, err := h.rpc.GetBlockNumber()
	if err != nil {
		h.mockGetRecentBlocks(c, count, start)
		return
	}

	blocks := make([]web3.BlockResult, 0, count)
	for i := uint64(0); i < uint64(count); i++ {
		blockNum := latestBlock - i
		cacheKey := "block:num:" + strconv.FormatUint(blockNum, 10)

		var cachedBlock web3.BlockResult
		if h.cacheGet(cacheKey, &cachedBlock) {
			blocks = append(blocks, cachedBlock)
			continue
		}

		block, err := h.rpc.GetBlockByNumber(blockNum)
		if err != nil {
			continue
		}
		h.cacheSet(cacheKey, block, h.cfg.Cache.BlockTTL)
		blocks = append(blocks, *block)
	}

	h.logQuery("blocks", "recent", "rpc", start, c)
	h.respond(c, gin.H{"blocks": blocks, "total": len(blocks)}, "rpc", nil)
}