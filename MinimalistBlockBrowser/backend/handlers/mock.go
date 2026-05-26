package handlers

import (
	"math/big"
	"math/rand"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type MockBlock struct {
	Number       string        `json:"number"`
	Hash         string        `json:"hash"`
	ParentHash   string        `json:"parentHash"`
	Timestamp    string        `json:"timestamp"`
	Transactions []interface{} `json:"transactions"`
	Miner        string        `json:"miner"`
	GasUsed      string        `json:"gasUsed"`
	GasLimit     string        `json:"gasLimit"`
	BaseFeePerGas string       `json:"baseFeePerGas"`
	Difficulty   string        `json:"difficulty"`
	Size         string        `json:"size"`
	Nonce        string        `json:"nonce"`
}

type MockTransaction struct {
	Hash        string `json:"hash"`
	BlockNumber string `json:"blockNumber"`
	BlockHash   string `json:"blockHash"`
	From        string `json:"from"`
	To          string `json:"to"`
	Value       string `json:"value"`
	GasPrice    string `json:"gasPrice"`
	Gas         string `json:"gas"`
	Nonce       string `json:"nonce"`
	Input       string `json:"input"`
}

type MockReceipt struct {
	TransactionHash string `json:"transactionHash"`
	BlockNumber     string `json:"blockNumber"`
	Status          string `json:"status"`
	GasUsed         string `json:"gasUsed"`
}

func mockBlock(number uint64) MockBlock {
	rand.Seed(time.Now().UnixNano() + int64(number))
	return MockBlock{
		Number:       "0x" + strconv.FormatUint(number, 16),
		Hash:         "0x" + randomHex(32),
		ParentHash:   "0x" + randomHex(32),
		Timestamp:    "0x" + strconv.FormatUint(uint64(time.Now().Unix())-number*12, 16),
		Transactions: make([]interface{}, rand.Intn(100)+50),
		Miner:        "0x" + randomHex(20),
		GasUsed:      "0x" + strconv.FormatUint(rand.Uint64()%10000000+10000000, 16),
		GasLimit:     "0x1c9c380",
		BaseFeePerGas: "0x" + strconv.FormatUint(rand.Uint64()%5000000000+1000000000, 16),
		Difficulty:   "0x" + strconv.FormatUint(rand.Uint64()%10000000+1000000, 16),
		Size:         "0x" + strconv.FormatUint(rand.Uint64()%100000+50000, 16),
		Nonce:        "0x" + randomHex(8),
	}
}

func mockTransaction(blockNum uint64, idx int) MockTransaction {
	rand.Seed(time.Now().UnixNano() + int64(blockNum) + int64(idx))
	return MockTransaction{
		Hash:        "0x" + randomHex(32),
		BlockNumber: "0x" + strconv.FormatUint(blockNum, 16),
		BlockHash:   "0x" + randomHex(32),
		From:        "0x" + randomHex(20),
		To:          "0x" + randomHex(20),
		Value:       "0x" + strconv.FormatUint(rand.Uint64()%1000000000000000000, 16),
		GasPrice:    "0x" + strconv.FormatUint(rand.Uint64()%50000000000+20000000000, 16),
		Gas:         "0x" + strconv.FormatUint(rand.Uint64()%200000+21000, 16),
		Nonce:       "0x" + strconv.FormatUint(rand.Uint64()%1000, 16),
		Input:       "0x",
	}
}

func mockReceipt(txHash string) MockReceipt {
	rand.Seed(time.Now().UnixNano())
	return MockReceipt{
		TransactionHash: txHash,
		BlockNumber:     "0x" + strconv.FormatUint(rand.Uint64()%100000+20000000, 16),
		Status:          "0x1",
		GasUsed:         "0x" + strconv.FormatUint(rand.Uint64()%100000+21000, 16),
	}
}

func mockLatestBlockNumber() uint64 {
	return 20000000 + uint64(rand.Intn(1000))
}

func randomHex(n int) string {
	const hexChars = "0123456789abcdef"
	b := make([]byte, n*2)
	for i := range b {
		b[i] = hexChars[rand.Intn(len(hexChars))]
	}
	return string(b)
}

func (h *Handler) mockGetGasTracker(c *gin.Context, start time.Time) {
	rand.Seed(time.Now().UnixNano())
	baseFee := 20 + rand.Float64()*30
	gasPrice := baseFee + rand.Float64()*10

	result := gin.H{
		"low":       strconv.FormatFloat(baseFee*0.9, 'f', 2, 64) + " gwei",
		"average":   strconv.FormatFloat(gasPrice, 'f', 2, 64) + " gwei",
		"high":      strconv.FormatFloat(baseFee*1.2, 'f', 2, 64) + " gwei",
		"baseFee":   strconv.FormatFloat(baseFee, 'f', 2, 64) + " gwei",
		"gasPrice":  strconv.FormatFloat(gasPrice, 'f', 2, 64) + " gwei",
		"timestamp": time.Now().Unix(),
	}

	h.cacheSet("gas:current", result, h.cfg.Cache.GasTTL)
	h.logQuery("gas", "current", "mock", start, c)
	h.respond(c, result, "mock", nil)
}

func (h *Handler) mockGetGasHistory(c *gin.Context, hours int, start time.Time) {
	history := make([]gin.H, 0)
	rand.Seed(time.Now().UnixNano())
	baseFee := 25.0

	for i := hours; i >= 0; i-- {
		change := (rand.Float64() - 0.5) * 5
		baseFee += change
		if baseFee < 10 {
			baseFee = 10
		}
		if baseFee > 100 {
			baseFee = 100
		}

		history = append(history, gin.H{
			"timestamp": uint64(time.Now().Unix()) - uint64(i*3600),
			"baseFee":   strconv.FormatFloat(baseFee, 'f', 2, 64),
			"block":     20000000 - i*300,
		})
	}

	result := gin.H{
		"history": history,
		"hours":   hours,
	}

	cacheKey := "gas:history:" + strconv.Itoa(hours)
	h.cacheSet(cacheKey, result, h.cfg.Cache.GasTTL)
	h.logQuery("gas_history", strconv.Itoa(hours), "mock", start, c)
	h.respond(c, result, "mock", nil)
}

func (h *Handler) mockGetAddress(c *gin.Context, address string, start time.Time) {
	rand.Seed(time.Now().UnixNano())
	balance := new(big.Int).SetUint64(rand.Uint64())
	balance.Mul(balance, big.NewInt(1000000000))

	nonce := rand.Uint64() % 1000
	isContract := rand.Intn(10) == 0

	result := gin.H{
		"address": address,
		"balance": "0x" + balance.Text(16),
		"nonce":   nonce,
		"txCount": nonce,
		"isContract": isContract,
	}

	if isContract {
		result["codeSize"] = rand.Intn(5000) + 500
	}

	cacheKey := "address:" + address
	h.cacheSet(cacheKey, result, h.cfg.Cache.AddressTTL)
	h.logQuery("address", address, "mock", start, c)
	h.respond(c, result, "mock", nil)
}

func (h *Handler) mockGetBlockByNumber(c *gin.Context, blockNum uint64, start time.Time) {
	block := mockBlock(blockNum)
	cacheKey := "block:num:" + strconv.FormatUint(blockNum, 10)
	h.cacheSet(cacheKey, block, h.cfg.Cache.BlockTTL)
	h.logQuery("block", strconv.FormatUint(blockNum, 10), "mock", start, c)
	h.respond(c, block, "mock", nil)
}

func (h *Handler) mockGetRecentBlocks(c *gin.Context, count int, start time.Time) {
	latest := mockLatestBlockNumber()
	blocks := make([]MockBlock, 0, count)
	for i := 0; i < count; i++ {
		blocks = append(blocks, mockBlock(latest-uint64(i)))
	}
	result := gin.H{"blocks": blocks, "total": len(blocks)}
	h.logQuery("blocks", "recent", "mock", start, c)
	h.respond(c, result, "mock", nil)
}

func (h *Handler) mockGetStats(c *gin.Context, start time.Time) {
	rand.Seed(time.Now().UnixNano())
	latest := mockLatestBlockNumber()
	block := mockBlock(latest)
	gasPrice := 20 + rand.Float64()*30

	result := gin.H{
		"latestBlock":     latest,
		"blockTimestamp":  block.Timestamp,
		"txCount":         len(block.Transactions),
		"gasPrice":        strconv.FormatFloat(gasPrice, 'f', 2, 64) + " gwei",
		"baseFee":         block.BaseFeePerGas,
		"difficulty":      block.Difficulty,
		"network":         h.cfg.Web3.NetworkName,
		"chainId":         "0x1",
		"totalQueries":    rand.Uint64() % 10000,
		"cacheHits":       rand.Uint64() % 5000,
		"rpcHits":         rand.Uint64() % 5000,
		"cacheHitRate":    65.5,
		"cacheSize":       h.cache.Size(),
		"serverTime":      time.Now().Unix(),
	}

	h.cacheSet("stats:overview", result, 5*time.Second)
	h.logQuery("stats", "overview", "mock", start, c)
	h.respond(c, result, "mock", nil)
}

func (h *Handler) mockGetTransaction(c *gin.Context, txHash string, start time.Time) {
	tx := mockTransaction(20000000, 0)
	tx.Hash = txHash
	receipt := mockReceipt(txHash)

	result := gin.H{
		"transaction": tx,
		"receipt":     receipt,
	}

	cacheKey := "tx:" + txHash
	h.cacheSet(cacheKey, tx, h.cfg.Cache.TransactionTTL)
	h.logQuery("transaction", txHash, "mock", start, c)
	h.respond(c, result, "mock", nil)
}