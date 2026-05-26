package utils

import (
	"encoding/csv"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/xuri/excelize/v2"
)

type CellData struct {
	Value  string `json:"value"`
	Formula string `json:"formula,omitempty"`
	Style  string `json:"style,omitempty"`
}

type SheetData struct {
	Name string       `json:"name"`
	Rows [][]CellData `json:"rows"`
}

func ReadExcel(filePath string) (*excelize.File, error) {
	return excelize.OpenFile(filePath)
}

func GetSheetList(f *excelize.File) []string {
	return f.GetSheetList()
}

func GetSheetData(f *excelize.File, sheetName string) (*SheetData, error) {
	rows, err := f.GetRows(sheetName)
	if err != nil {
		return nil, err
	}

	result := &SheetData{
		Name: sheetName,
		Rows: make([][]CellData, len(rows)),
	}

	for i, row := range rows {
		result.Rows[i] = make([]CellData, len(row))
		for j, cellValue := range row {
			cellName, _ := excelize.CoordinatesToCellName(j+1, i+1)
			formula, _ := f.GetCellFormula(sheetName, cellName)
			
			result.Rows[i][j] = CellData{
				Value:   cellValue,
				Formula: formula,
			}
		}
	}

	return result, nil
}

func ExportToCSV(f *excelize.File, sheetName, outputDir string) (string, error) {
	rows, err := f.GetRows(sheetName)
	if err != nil {
		return "", err
	}

	fileName := fmt.Sprintf("%s.csv", strings.ReplaceAll(sheetName, "/", "_"))
	filePath := filepath.Join(outputDir, fileName)

	file, err := os.Create(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	for _, row := range rows {
		if err := writer.Write(row); err != nil {
			return "", err
		}
	}

	return filePath, nil
}

func GenerateShareToken() string {
	return fmt.Sprintf("%d", os.Getpid()) + RandomString(8)
}

func RandomString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[os.Getpid()%len(letters)]
	}
	return string(b)
}
