package web3

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type RPCClient struct {
	endpoint   string
	apiKey     string
	httpClient *http.Client
}

type RPCRequest struct {
	JSONRPC string        `json:"jsonrpc"`
	Method  string        `json:"method"`
	Params  []interface{} `json:"params"`
	ID      int           `json:"id"`
}

type RPCResponse struct {
	JSONRPC string          `json:"jsonrpc"`
	Result  json.RawMessage `json:"result"`
	Error   *RPCError       `json:"error,omitempty"`
	ID      int             `json:"id"`
}

type RPCError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

type BlockResult struct {
	Number       string        `json:"number"`
	Hash         string        `json:"hash"`
	ParentHash   string        `json:"parentHash"`
	Timestamp    string        `json:"timestamp"`
	Transactions []interface{} `json:"transactions"`
	Miner        string        `json:"miner"`
	GasUsed      string        `json:"gasUsed"`
	GasLimit     string        `json:"gasLimit"`
	BaseFeePerGas string       `json:"baseFeePerGas,omitempty"`
	Difficulty   string        `json:"difficulty"`
	Size         string        `json:"size"`
	Nonce        string        `json:"nonce"`
}

type TransactionResult struct {
	Hash             string `json:"hash"`
	BlockNumber      string `json:"blockNumber"`
	BlockHash        string `json:"blockHash"`
	From             string `json:"from"`
	To               string `json:"to"`
	Value            string `json:"value"`
	GasPrice         string `json:"gasPrice"`
	Gas              string `json:"gas"`
	Nonce            string `json:"nonce"`
	Input            string `json:"input"`
	TransactionIndex string `json:"transactionIndex"`
	V                string `json:"v"`
	R                string `json:"r"`
	S                string `json:"s"`
}

type TransactionReceiptResult struct {
	TransactionHash string `json:"transactionHash"`
	BlockNumber     string `json:"blockNumber"`
	Status          string `json:"status"`
	GasUsed         string `json:"gasUsed"`
	ContractAddress string `json:"contractAddress,omitempty"`
	Logs            []Log  `json:"logs"`
}

type Log struct {
	Address string   `json:"address"`
	Topics  []string `json:"topics"`
	Data    string   `json:"data"`
}

func NewRPCClient(endpoint, apiKey string) *RPCClient {
	return &RPCClient{
		endpoint: endpoint + apiKey,
		apiKey:   apiKey,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *RPCClient) call(method string, params []interface{}) (json.RawMessage, error) {
	reqBody := RPCRequest{
		JSONRPC: "2.0",
		Method:  method,
		Params:  params,
		ID:      1,
	}

	data, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", c.endpoint, bytes.NewBuffer(data))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("RPC request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var rpcResp RPCResponse
	if err := json.Unmarshal(body, &rpcResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if rpcResp.Error != nil {
		return nil, fmt.Errorf("RPC error [%d]: %s", rpcResp.Error.Code, rpcResp.Error.Message)
	}

	return rpcResp.Result, nil
}

func (c *RPCClient) GetBlockNumber() (uint64, error) {
	result, err := c.call("eth_blockNumber", []interface{}{})
	if err != nil {
		return 0, err
	}
	var hexNum string
	if err := json.Unmarshal(result, &hexNum); err != nil {
		return 0, err
	}
	return hexToUint64(hexNum), nil
}

func (c *RPCClient) GetBlockByNumber(blockNum uint64) (*BlockResult, error) {
	hexNum := fmt.Sprintf("0x%x", blockNum)
	result, err := c.call("eth_getBlockByNumber", []interface{}{hexNum, true})
	if err != nil {
		return nil, err
	}
	var block BlockResult
	if err := json.Unmarshal(result, &block); err != nil {
		return nil, err
	}
	return &block, nil
}

func (c *RPCClient) GetBlockByHash(hash string) (*BlockResult, error) {
	result, err := c.call("eth_getBlockByHash", []interface{}{hash, true})
	if err != nil {
		return nil, err
	}
	var block BlockResult
	if err := json.Unmarshal(result, &block); err != nil {
		return nil, err
	}
	return &block, nil
}

func (c *RPCClient) GetTransactionByHash(txHash string) (*TransactionResult, error) {
	result, err := c.call("eth_getTransactionByHash", []interface{}{txHash})
	if err != nil {
		return nil, err
	}
	var tx TransactionResult
	if err := json.Unmarshal(result, &tx); err != nil {
		return nil, err
	}
	return &tx, nil
}

func (c *RPCClient) GetTransactionReceipt(txHash string) (*TransactionReceiptResult, error) {
	result, err := c.call("eth_getTransactionReceipt", []interface{}{txHash})
	if err != nil {
		return nil, err
	}
	var receipt TransactionReceiptResult
	if err := json.Unmarshal(result, &receipt); err != nil {
		return nil, err
	}
	return &receipt, nil
}

func (c *RPCClient) GetBalance(address string) (string, error) {
	result, err := c.call("eth_getBalance", []interface{}{address, "latest"})
	if err != nil {
		return "", err
	}
	var balance string
	if err := json.Unmarshal(result, &balance); err != nil {
		return "", err
	}
	return balance, nil
}

func (c *RPCClient) GetTransactionCount(address string) (uint64, error) {
	result, err := c.call("eth_getTransactionCount", []interface{}{address, "latest"})
	if err != nil {
		return 0, err
	}
	var hexNum string
	if err := json.Unmarshal(result, &hexNum); err != nil {
		return 0, err
	}
	return hexToUint64(hexNum), nil
}

func (c *RPCClient) GetCode(address string) (string, error) {
	result, err := c.call("eth_getCode", []interface{}{address, "latest"})
	if err != nil {
		return "", err
	}
	var code string
	if err := json.Unmarshal(result, &code); err != nil {
		return "", err
	}
	return code, nil
}

func (c *RPCClient) GetGasPrice() (string, error) {
	result, err := c.call("eth_gasPrice", []interface{}{})
	if err != nil {
		return "", err
	}
	var price string
	if err := json.Unmarshal(result, &price); err != nil {
		return "", err
	}
	return price, nil
}

func (c *RPCClient) GetFeeHistory(blockCount int, newestBlock string, rewardPercentiles []float64) (map[string]interface{}, error) {
	result, err := c.call("eth_feeHistory", []interface{}{fmt.Sprintf("0x%x", blockCount), newestBlock, rewardPercentiles})
	if err != nil {
		return nil, err
	}
	var feeHistory map[string]interface{}
	if err := json.Unmarshal(result, &feeHistory); err != nil {
		return nil, err
	}
	return feeHistory, nil
}

func (c *RPCClient) ChainID() (string, error) {
	result, err := c.call("eth_chainId", []interface{}{})
	if err != nil {
		return "", err
	}
	var chainID string
	if err := json.Unmarshal(result, &chainID); err != nil {
		return "", err
	}
	return chainID, nil
}

func hexToUint64(hex string) uint64 {
	if len(hex) < 2 || hex[:2] != "0x" {
		return 0
	}
	var result uint64
	for _, c := range hex[2:] {
		result <<= 4
		switch {
		case c >= '0' && c <= '9':
			result |= uint64(c - '0')
		case c >= 'a' && c <= 'f':
			result |= uint64(c-'a') + 10
		case c >= 'A' && c <= 'F':
			result |= uint64(c-'A') + 10
		}
	}
	return result
}