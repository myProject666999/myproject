package models

import "time"

type Title struct {
	ID          uint64    `json:"id"`
	Name        string    `json:"name"`
	TaxNumber   string    `json:"tax_number"`
	Address     string    `json:"address"`
	Phone       string    `json:"phone"`
	BankAccount string    `json:"bank_account"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type InvoiceItem struct {
	ID            uint64  `json:"id"`
	ApplicationID uint64  `json:"application_id"`
	ProductName   string  `json:"product_name"`
	Specification string  `json:"specification"`
	Unit          string  `json:"unit"`
	Quantity      float64 `json:"quantity"`
	UnitPrice     float64 `json:"unit_price"`
	Amount        float64 `json:"amount"`
	TaxRate       float64 `json:"tax_rate"`
	TaxAmount     float64 `json:"tax_amount"`
}

type InvoiceApplication struct {
	ID          uint64         `json:"id"`
	TitleID     uint64         `json:"title_id"`
	Title       *Title         `json:"title,omitempty"`
	Status      int            `json:"status"`
	StatusText  string         `json:"status_text"`
	TotalAmount float64        `json:"total_amount"`
	NetAmount   float64        `json:"net_amount"`
	TaxAmount   float64        `json:"tax_amount"`
	Applicant   string         `json:"applicant"`
	Remark      string         `json:"remark"`
	Items       []InvoiceItem  `json:"items"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

type Invoice struct {
	ID             uint64    `json:"id"`
	ApplicationID  uint64    `json:"application_id"`
	TitleID        uint64    `json:"title_id"`
	InvoiceNumber  string    `json:"invoice_number"`
	InvoiceCode    string    `json:"invoice_code"`
	IssuedDate     string    `json:"issued_date"`
	TotalAmount    float64   `json:"total_amount"`
	NetAmount      float64   `json:"net_amount"`
	TaxAmount      float64   `json:"tax_amount"`
	PdfPath        string    `json:"pdf_path"`
	Remark         string    `json:"remark"`
	Title          *Title    `json:"title,omitempty"`
	Application    *InvoiceApplication `json:"application,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
}

type CreateApplicationRequest struct {
	TitleID   uint64           `json:"title_id" validate:"required"`
	Applicant string           `json:"applicant"`
	Remark    string           `json:"remark"`
	Items     []InvoiceItem    `json:"items" validate:"required,min=1"`
}

type ReviewRequest struct {
	Status int    `json:"status" validate:"required,oneof=2 3"`
	Remark string `json:"remark"`
}

type IssueInvoiceRequest struct {
	InvoiceNumber string  `json:"invoice_number" validate:"required"`
	InvoiceCode   string  `json:"invoice_code"`
	IssuedDate    string  `json:"issued_date" validate:"required"`
	PdfPath       string  `json:"pdf_path"`
	Remark        string  `json:"remark"`
}