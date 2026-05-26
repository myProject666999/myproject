package handlers

import (
	"math/big"
	"minimalist-block-browser/database"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func (h *Handler) GetStats(c *gin.Context) {
	start := time.Now()

	cacheKey := "stats:overview"

	var cachedData interface{}
	if h.cacheGet(cacheKey, &cachedData) {
		h.logQuery("stats", "overview", "cache", start, c)
		h.respond(c, cachedData, "cache", nil)
		return
	}

	latestBlock, err := h.rpc.GetBlockNumber()
	if err != nil {
		h.mockGetStats(c, start)
		return
	}

	block, err := h.rpc.GetBlockByNumber(latestBlock)
	if err != nil {
		h.mockGetStats(c, start)
		return
	}

	gasPriceHex, err := h.rpc.GetGasPrice()
	if err != nil {
		h.mockGetStats(c, start)
		return
	}

	gasPrice := hexToBigInt(gasPriceHex)
	gasPriceGwei := new(big.Float).Quo(new(big.Float).SetInt(gasPrice), big.NewFloat(1e9))

	chainID, err := h.rpc.ChainID()
	if err != nil {
		chainID = "unknown"
	}

	totalQueries, cacheHits, rpcHits, _ := database.GetStats()
	cacheHitRate := float64(0)
	if totalQueries > 0 {
		cacheHitRate = float64(cacheHits) / float64(totalQueries) * 100
	}

	result := gin.H{
		"latestBlock":     latestBlock,
		"blockTimestamp":  block.Timestamp,
		"txCount":         len(block.Transactions),
		"gasPrice":        gasPriceGwei.Text('f', 2) + " gwei",
		"baseFee":         block.BaseFeePerGas,
		"difficulty":      block.Difficulty,
		"network":         h.cfg.Web3.NetworkName,
		"chainId":         chainID,
		"totalQueries":    totalQueries,
		"cacheHits":       cacheHits,
		"rpcHits":         rpcHits,
		"cacheHitRate":    cacheHitRate,
		"cacheSize":       h.cache.Size(),
		"serverTime":      time.Now().Unix(),
	}

	h.cacheSet(cacheKey, result, 5*time.Second)
	h.logQuery("stats", "overview", "rpc", start, c)
	h.respond(c, result, "rpc", nil)
}

func (h *Handler) Search(c *gin.Context) {
	start := time.Now()
	query := c.Query("q")

	if query == "" {
		h.respondError(c, http.StatusBadRequest, "query parameter 'q' is required")
		return
	}

	queryType := detectQueryType(query)
	h.logQuery("search", query, "detected", start, c)

	h.respond(c, gin.H{
		"query":     query,
		"type":      queryType,
		"redirect":  getRedirectPath(queryType, query),
	}, "rpc", nil)
}

func detectQueryType(query string) string {
	if len(query) == 0 {
		return "unknown"
	}

	if len(query) == 66 && query[:2] == "0x" {
		return "transaction"
	}

	if len(query) == 42 && query[:2] == "0x" {
		return "address"
	}

	if len(query) == 64 {
		if query[:2] == "0x" {
			return "block"
		}
		return "transaction"
	}

	if len(query) > 2 && query[:2] == "0x" {
		hexLen := len(query) - 2
		if hexLen == 40 {
			return "address"
		}
		if hexLen == 64 {
			return "transaction"
		}
		if hexLen >= 60 {
			return "block"
		}
	}

	if _, err := strconv.ParseUint(query, 10, 64); err == nil {
		return "block_number"
	}

	return "unknown"
}

func getRedirectPath(queryType, query string) string {
	switch queryType {
	case "transaction":
		return "/transaction/" + query
	case "address":
		return "/address/" + query
	case "block":
		return "/block/hash/" + query
	case "block_number":
		return "/block/" + query
	default:
		return ""
	}
}