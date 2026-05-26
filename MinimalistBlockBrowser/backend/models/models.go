package models

import (
	"database/sql"
	"encoding/json"
	"time"
)

type CachedBlock struct {
	ID           uint64         `json:"id"`
	BlockNumber  uint64         `json:"block_number"`
	BlockHash    string         `json:"block_hash"`
	Timestamp    uint64         `json:"timestamp"`
	TxCount      uint32         `json:"tx_count"`
	Miner        sql.NullString `json:"miner"`
	GasUsed      sql.NullString `json:"gas_used"`
	GasLimit     sql.NullString `json:"gas_limit"`
	BaseFee      sql.NullString `json:"base_fee"`
	RawData      json.RawMessage `json:"raw_data"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
}

type CachedTransaction struct {
	ID           uint64         `json:"id"`
	TxHash       string         `json:"tx_hash"`
	BlockNumber  uint64         `json:"block_number"`
	FromAddress  sql.NullString `json:"from_address"`
	ToAddress    sql.NullString `json:"to_address"`
	Value        sql.NullString `json:"value"`
	GasPrice     sql.NullString `json:"gas_price"`
	GasUsed      sql.NullString `json:"gas_used"`
	Nonce        sql.NullString `json:"nonce"`
	Status       sql.NullInt16  `json:"status"`
	RawData      json.RawMessage `json:"raw_data"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
}

type CachedAddress struct {
	ID            uint64          `json:"id"`
	Address       string          `json:"address"`
	Balance       sql.NullString  `json:"balance"`
	Nonce         sql.NullString  `json:"nonce"`
	TxCount       uint32          `json:"tx_count"`
	IsContract    bool            `json:"is_contract"`
	ContractName  sql.NullString  `json:"contract_name"`
	RawData       json.RawMessage `json:"raw_data"`
	CreatedAt     time.Time       `json:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at"`
}

type GasHistory struct {
	ID          uint64         `json:"id"`
	Timestamp   uint64         `json:"timestamp"`
	Low         sql.NullString `json:"low"`
	Average     sql.NullString `json:"average"`
	High        sql.NullString `json:"high"`
	BaseFee     sql.NullString `json:"base_fee"`
	BlockNumber sql.NullInt64  `json:"block_number"`
	CreatedAt   time.Time      `json:"created_at"`
}

type QueryLog struct {
	ID           uint64         `json:"id"`
	QueryType    string         `json:"query_type"`
	QueryValue   sql.NullString `json:"query_value"`
	Source       sql.NullString `json:"source"`
	ResponseTime sql.NullInt32  `json:"response_time"`
	IPAddress    sql.NullString `json:"ip_address"`
	UserAgent    sql.NullString `json:"user_agent"`
	CreatedAt    time.Time      `json:"created_at"`
}

type BlockResponse struct {
	BlockNumber  string          `json:"blockNumber"`
	BlockHash    string          `json:"blockHash"`
	Timestamp    string          `json:"timestamp"`
	Transactions uint32          `json:"transactions"`
	Miner        string          `json:"miner,omitempty"`
	GasUsed      string          `json:"gasUsed,omitempty"`
	GasLimit     string          `json:"gasLimit,omitempty"`
	BaseFee      string          `json:"baseFee,omitempty"`
	Difficulty   string          `json:"difficulty,omitempty"`
	Size         string          `json:"size,omitempty"`
	Nonce        string          `json:"nonce,omitempty"`
}

type TransactionResponse struct {
	TxHash       string `json:"txHash"`
	BlockNumber  string `json:"blockNumber"`
	From         string `json:"from"`
	To           string `json:"to"`
	Value        string `json:"value"`
	GasPrice     string `json:"gasPrice"`
	GasUsed      string `json:"gasUsed"`
	Nonce        string `json:"nonce"`
	Status       string `json:"status"`
	Timestamp    string `json:"timestamp,omitempty"`
}

type AddressResponse struct {
	Address      string `json:"address"`
	Balance      string `json:"balance"`
	Nonce        string `json:"nonce"`
	TxCount      uint32 `json:"txCount"`
	IsContract   bool   `json:"isContract"`
	ContractName string `json:"contractName,omitempty"`
}

type GasResponse struct {
	Low       string `json:"low"`
	Average   string `json:"average"`
	High      string `json:"high"`
	BaseFee   string `json:"baseFee"`
	Timestamp uint64 `json:"timestamp"`
}

type StatsResponse struct {
	LatestBlock     uint64 `json:"latestBlock"`
	PendingTx       uint64 `json:"pendingTx"`
	NetworkHashRate string `json:"networkHashRate"`
	GasPrice        string `json:"gasPrice"`
	TotalQueryCount uint64 `json:"totalQueryCount"`
	CacheHitRate    string `json:"cacheHitRate"`
}