package utils

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
)

func CalculateHash(data interface{}) string {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return ""
	}

	hash := sha256.Sum256(jsonData)
	return hex.EncodeToString(hash[:])
}

func VerifyHash(data interface{}, hash string) bool {
	calculatedHash := CalculateHash(data)
	return calculatedHash == hash
}

func GenerateSettlementHash(stakeholderID uint64, settlementPeriod string, totalAmount float64, details []interface{}) string {
	data := fmt.Sprintf("%d_%s_%.2f", stakeholderID, settlementPeriod, totalAmount)
	for _, d := range details {
		detailJSON, _ := json.Marshal(d)
		data += "_" + string(detailJSON)
	}
	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:])
}
