package handlers

import (
	"math/big"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func (h *Handler) GetGasTracker(c *gin.Context) {
	start := time.Now()

	cacheKey := "gas:current"

	var cachedData interface{}
	if h.cacheGet(cacheKey, &cachedData) {
		h.logQuery("gas", "current", "cache", start, c)
		h.respond(c, cachedData, "cache", nil)
		return
	}

	gasPriceHex, err := h.rpc.GetGasPrice()
	if err != nil {
		h.mockGetGasTracker(c, start)
		return
	}

	gasPrice := hexToBigInt(gasPriceHex)
	gasPriceGwei := new(big.Float).Quo(new(big.Float).SetInt(gasPrice), big.NewFloat(1e9))

	latestBlock, err := h.rpc.GetBlockNumber()
	if err != nil {
		h.mockGetGasTracker(c, start)
		return
	}

	block, err := h.rpc.GetBlockByNumber(latestBlock)
	if err != nil {
		h.mockGetGasTracker(c, start)
		return
	}

	var baseFeeGwei string
	if block.BaseFeePerGas != "" {
		baseFee := hexToBigInt(block.BaseFeePerGas)
		baseFeeGwei = new(big.Float).Quo(new(big.Float).SetInt(baseFee), big.NewFloat(1e9)).Text('f', 2)
	}

	low := new(big.Float).Mul(gasPriceGwei, big.NewFloat(0.9))
	average := gasPriceGwei
	high := new(big.Float).Mul(gasPriceGwei, big.NewFloat(1.2))

	result := gin.H{
		"low":       low.Text('f', 2) + " gwei",
		"average":   average.Text('f', 2) + " gwei",
		"high":      high.Text('f', 2) + " gwei",
		"baseFee":   baseFeeGwei + " gwei",
		"gasPrice":  gasPriceGwei.Text('f', 2) + " gwei",
		"timestamp": time.Now().Unix(),
	}

	h.cacheSet(cacheKey, result, h.cfg.Cache.GasTTL)
	h.logQuery("gas", "current", "rpc", start, c)
	h.respond(c, result, "rpc", nil)
}

func (h *Handler) GetGasHistory(c *gin.Context) {
	start := time.Now()
	hours := 24
	if hParam := c.Query("hours"); hParam != "" {
		if n, err := strconv.Atoi(hParam); err == nil && n > 0 && n <= 168 {
			hours = n
		}
	}

	cacheKey := "gas:history:" + strconv.Itoa(hours)

	var cachedData interface{}
	if h.cacheGet(cacheKey, &cachedData) {
		h.logQuery("gas_history", strconv.Itoa(hours), "cache", start, c)
		h.respond(c, cachedData, "cache", nil)
		return
	}

	latestBlock, err := h.rpc.GetBlockNumber()
	if err != nil {
		h.mockGetGasHistory(c, hours, start)
		return
	}

	history := make([]gin.H, 0)
	blocksPerSample := uint64(12 * 60 * 6)

	for i := 0; i < hours; i++ {
		blockNum := latestBlock - uint64(i)*blocksPerSample/4
		if blockNum < 0 {
			break
		}

		block, err := h.rpc.GetBlockByNumber(blockNum)
		if err != nil {
			continue
		}

		var baseFeeGwei string
		if block.BaseFeePerGas != "" {
			baseFee := hexToBigInt(block.BaseFeePerGas)
			baseFeeGwei = new(big.Float).Quo(new(big.Float).SetInt(baseFee), big.NewFloat(1e9)).Text('f', 2)
		}

		ts := hexToBigInt(block.Timestamp)
		history = append(history, gin.H{
			"timestamp": ts.Uint64(),
			"baseFee":   baseFeeGwei,
			"block":     blockNum,
		})
	}

	result := gin.H{
		"history": history,
		"hours":   hours,
	}

	h.cacheSet(cacheKey, result, h.cfg.Cache.GasTTL)
	h.logQuery("gas_history", strconv.Itoa(hours), "rpc", start, c)
	h.respond(c, result, "rpc", nil)
}

func hexToBigInt(hex string) *big.Int {
	if len(hex) >= 2 && hex[:2] == "0x" {
		hex = hex[2:]
	}
	result := new(big.Int)
	result.SetString(hex, 16)
	return result
}