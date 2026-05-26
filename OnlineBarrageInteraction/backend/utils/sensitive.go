package utils

import (
	"strings"
)

var sensitiveWords = []string{
	"敏感词1",
	"敏感词2",
	"测试敏感词",
	"违禁词",
	"不文明用语",
}

func FilterSensitiveWords(content string) (string, bool) {
	hasSensitive := false
	filtered := content

	for _, word := range sensitiveWords {
		if strings.Contains(filtered, word) {
			hasSensitive = true
			replacement := strings.Repeat("*", len([]rune(word)))
			filtered = strings.ReplaceAll(filtered, word, replacement)
		}
	}

	return filtered, hasSensitive
}

func IsSensitive(content string) bool {
	for _, word := range sensitiveWords {
		if strings.Contains(content, word) {
			return true
		}
	}
	return false
}

func AddSensitiveWord(word string) {
	sensitiveWords = append(sensitiveWords, word)
}

func RemoveSensitiveWord(word string) {
	for i, w := range sensitiveWords {
		if w == word {
			sensitiveWords = append(sensitiveWords[:i], sensitiveWords[i+1:]...)
			break
		}
	}
}

func GetSensitiveWords() []string {
	return sensitiveWords
}
