package repository

import (
	"database/sql"
	"fmt"
	"online-invoice-management/internal/db"
	"online-invoice-management/internal/models"
	"strings"
)

func GetTitles(keyword string) ([]models.Title, error) {
	query := "SELECT id, name, tax_number, address, phone, bank_account, created_at, updated_at FROM titles WHERE 1=1"
	var args []interface{}

	if keyword != "" {
		query += " AND (name LIKE ? OR tax_number LIKE ?)"
		args = append(args, "%"+keyword+"%", "%"+keyword+"%")
	}
	query += " ORDER BY created_at DESC"

	rows, err := db.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var titles []models.Title
	for rows.Next() {
		var t models.Title
		var address, phone, bankAccount sql.NullString
		err := rows.Scan(&t.ID, &t.Name, &t.TaxNumber, &address, &phone, &bankAccount, &t.CreatedAt, &t.UpdatedAt)
		if err != nil {
			return nil, err
		}
		t.Address = address.String
		t.Phone = phone.String
		t.BankAccount = bankAccount.String
		titles = append(titles, t)
	}
	if titles == nil {
		titles = []models.Title{}
	}
	return titles, nil
}

func GetTitleByID(id uint64) (*models.Title, error) {
	query := "SELECT id, name, tax_number, address, phone, bank_account, created_at, updated_at FROM titles WHERE id = ?"
	row := db.DB.QueryRow(query, id)

	var t models.Title
	var address, phone, bankAccount sql.NullString
	err := row.Scan(&t.ID, &t.Name, &t.TaxNumber, &address, &phone, &bankAccount, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	t.Address = address.String
	t.Phone = phone.String
	t.BankAccount = bankAccount.String
	return &t, nil
}

func GetTitleByTaxNumber(taxNumber string) (*models.Title, error) {
	query := "SELECT id, name, tax_number, address, phone, bank_account, created_at, updated_at FROM titles WHERE tax_number = ?"
	row := db.DB.QueryRow(query, taxNumber)

	var t models.Title
	var address, phone, bankAccount sql.NullString
	err := row.Scan(&t.ID, &t.Name, &t.TaxNumber, &address, &phone, &bankAccount, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	t.Address = address.String
	t.Phone = phone.String
	t.BankAccount = bankAccount.String
	return &t, nil
}

func CreateTitle(t *models.Title) error {
	query := "INSERT INTO titles (name, tax_number, address, phone, bank_account) VALUES (?, ?, ?, ?, ?)"
	result, err := db.DB.Exec(query, t.Name, t.TaxNumber, nullStr(t.Address), nullStr(t.Phone), nullStr(t.BankAccount))
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	t.ID = uint64(id)
	return nil
}

func UpdateTitle(t *models.Title) error {
	query := "UPDATE titles SET name=?, tax_number=?, address=?, phone=?, bank_account=? WHERE id=?"
	_, err := db.DB.Exec(query, t.Name, t.TaxNumber, nullStr(t.Address), nullStr(t.Phone), nullStr(t.BankAccount), t.ID)
	return err
}

func DeleteTitle(id uint64) error {
	query := "DELETE FROM titles WHERE id = ?"
	_, err := db.DB.Exec(query, id)
	return err
}

func GetApplications(status int, keyword string) ([]models.InvoiceApplication, error) {
	query := `SELECT a.id, a.title_id, a.status, a.total_amount, a.net_amount, a.tax_amount, 
		a.applicant, a.remark, a.created_at, a.updated_at,
		t.id, t.name, t.tax_number, t.address, t.phone, t.bank_account
		FROM invoice_applications a 
		LEFT JOIN titles t ON a.title_id = t.id 
		WHERE 1=1`
	var args []interface{}

	if status > 0 {
		query += " AND a.status = ?"
		args = append(args, status)
	}
	if keyword != "" {
		query += " AND (t.name LIKE ? OR t.tax_number LIKE ? OR a.applicant LIKE ?)"
		args = append(args, "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}
	query += " ORDER BY a.created_at DESC"

	rows, err := db.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var apps []models.InvoiceApplication
	for rows.Next() {
		var a models.InvoiceApplication
		var t models.Title
		var applicant, remark sql.NullString
		var tAddress, tPhone, tBankAccount sql.NullString
		err := rows.Scan(&a.ID, &a.TitleID, &a.Status, &a.TotalAmount, &a.NetAmount, &a.TaxAmount,
			&applicant, &remark, &a.CreatedAt, &a.UpdatedAt,
			&t.ID, &t.Name, &t.TaxNumber, &tAddress, &tPhone, &tBankAccount)
		if err != nil {
			return nil, err
		}
		t.Address = tAddress.String
		t.Phone = tPhone.String
		t.BankAccount = tBankAccount.String
		a.Applicant = applicant.String
		a.Remark = remark.String
		a.Title = &t
		a.StatusText = statusText(a.Status)
		apps = append(apps, a)
	}
	if apps == nil {
		apps = []models.InvoiceApplication{}
	}
	return apps, nil
}

func GetApplicationByID(id uint64) (*models.InvoiceApplication, error) {
	query := `SELECT a.id, a.title_id, a.status, a.total_amount, a.net_amount, a.tax_amount, 
		a.applicant, a.remark, a.created_at, a.updated_at,
		t.id, t.name, t.tax_number, t.address, t.phone, t.bank_account
		FROM invoice_applications a 
		LEFT JOIN titles t ON a.title_id = t.id 
		WHERE a.id = ?`
	row := db.DB.QueryRow(query, id)

	var a models.InvoiceApplication
	var t models.Title
	var applicant, remark sql.NullString
	var tAddress, tPhone, tBankAccount sql.NullString
	err := row.Scan(&a.ID, &a.TitleID, &a.Status, &a.TotalAmount, &a.NetAmount, &a.TaxAmount,
		&applicant, &remark, &a.CreatedAt, &a.UpdatedAt,
		&t.ID, &t.Name, &t.TaxNumber, &tAddress, &tPhone, &tBankAccount)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	t.Address = tAddress.String
	t.Phone = tPhone.String
	t.BankAccount = tBankAccount.String
	a.Applicant = applicant.String
	a.Remark = remark.String
	a.Title = &t
	a.StatusText = statusText(a.Status)

	items, err := GetItemsByApplicationID(a.ID)
	if err != nil {
		return nil, err
	}
	a.Items = items

	return &a, nil
}

func CreateApplication(a *models.InvoiceApplication) error {
	tx, err := db.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := "INSERT INTO invoice_applications (title_id, status, total_amount, net_amount, tax_amount, applicant, remark) VALUES (?, 1, ?, ?, ?, ?, ?)"
	result, err := tx.Exec(query, a.TitleID, a.TotalAmount, a.NetAmount, a.TaxAmount, nullStr(a.Applicant), nullStr(a.Remark))
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	a.ID = uint64(id)

	for i := range a.Items {
		item := a.Items[i]
		itemQuery := "INSERT INTO invoice_items (application_id, product_name, specification, unit, quantity, unit_price, amount, tax_rate, tax_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
		_, err := tx.Exec(itemQuery, a.ID, item.ProductName, nullStr(item.Specification), nullStr(item.Unit), item.Quantity, item.UnitPrice, item.Amount, item.TaxRate, item.TaxAmount)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func UpdateApplicationStatus(id uint64, status int) error {
	query := "UPDATE invoice_applications SET status = ? WHERE id = ?"
	_, err := db.DB.Exec(query, status, id)
	return err
}

func GetItemsByApplicationID(applicationID uint64) ([]models.InvoiceItem, error) {
	query := "SELECT id, application_id, product_name, specification, unit, quantity, unit_price, amount, tax_rate, tax_amount FROM invoice_items WHERE application_id = ?"
	rows, err := db.DB.Query(query, applicationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []models.InvoiceItem
	for rows.Next() {
		var item models.InvoiceItem
		var specification, unit sql.NullString
		err := rows.Scan(&item.ID, &item.ApplicationID, &item.ProductName, &specification, &unit, &item.Quantity, &item.UnitPrice, &item.Amount, &item.TaxRate, &item.TaxAmount)
		if err != nil {
			return nil, err
		}
		item.Specification = specification.String
		item.Unit = unit.String
		items = append(items, item)
	}
	if items == nil {
		items = []models.InvoiceItem{}
	}
	return items, nil
}

func CreateInvoice(inv *models.Invoice) error {
	query := "INSERT INTO invoices (application_id, title_id, invoice_number, invoice_code, issued_date, total_amount, net_amount, tax_amount, pdf_path, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
	result, err := db.DB.Exec(query, inv.ApplicationID, inv.TitleID, inv.InvoiceNumber, nullStr(inv.InvoiceCode), inv.IssuedDate, inv.TotalAmount, inv.NetAmount, inv.TaxAmount, nullStr(inv.PdfPath), nullStr(inv.Remark))
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	inv.ID = uint64(id)
	return nil
}

func GetInvoices(keyword string) ([]models.Invoice, error) {
	query := `SELECT i.id, i.application_id, i.title_id, i.invoice_number, i.invoice_code, i.issued_date, 
		i.total_amount, i.net_amount, i.tax_amount, i.pdf_path, i.remark, i.created_at,
		t.id, t.name, t.tax_number
		FROM invoices i 
		LEFT JOIN titles t ON i.title_id = t.id 
		WHERE 1=1`
	var args []interface{}

	if keyword != "" {
		query += " AND (i.invoice_number LIKE ? OR t.name LIKE ? OR t.tax_number LIKE ?)"
		args = append(args, "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}
	query += " ORDER BY i.created_at DESC"

	rows, err := db.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var invoices []models.Invoice
	for rows.Next() {
		var inv models.Invoice
		var t models.Title
		var invoiceCode, pdfPath, remark sql.NullString
		err := rows.Scan(&inv.ID, &inv.ApplicationID, &inv.TitleID, &inv.InvoiceNumber, &invoiceCode, &inv.IssuedDate,
			&inv.TotalAmount, &inv.NetAmount, &inv.TaxAmount, &pdfPath, &remark, &inv.CreatedAt,
			&t.ID, &t.Name, &t.TaxNumber)
		if err != nil {
			return nil, err
		}
		inv.InvoiceCode = invoiceCode.String
		inv.PdfPath = pdfPath.String
		inv.Remark = remark.String
		inv.Title = &t
		invoices = append(invoices, inv)
	}
	if invoices == nil {
		invoices = []models.Invoice{}
	}
	return invoices, nil
}

func GetInvoiceByID(id uint64) (*models.Invoice, error) {
	query := `SELECT i.id, i.application_id, i.title_id, i.invoice_number, i.invoice_code, i.issued_date, 
		i.total_amount, i.net_amount, i.tax_amount, i.pdf_path, i.remark, i.created_at,
		t.id, t.name, t.tax_number, t.address, t.phone, t.bank_account
		FROM invoices i 
		LEFT JOIN titles t ON i.title_id = t.id 
		WHERE i.id = ?`
	row := db.DB.QueryRow(query, id)

	var inv models.Invoice
	var t models.Title
	var invoiceCode, pdfPath, remark sql.NullString
	var tAddress, tPhone, tBankAccount sql.NullString
	err := row.Scan(&inv.ID, &inv.ApplicationID, &inv.TitleID, &inv.InvoiceNumber, &invoiceCode, &inv.IssuedDate,
		&inv.TotalAmount, &inv.NetAmount, &inv.TaxAmount, &pdfPath, &remark, &inv.CreatedAt,
		&t.ID, &t.Name, &t.TaxNumber, &tAddress, &tPhone, &tBankAccount)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	inv.InvoiceCode = invoiceCode.String
	inv.PdfPath = pdfPath.String
	inv.Remark = remark.String
	t.Address = tAddress.String
	t.Phone = tPhone.String
	t.BankAccount = tBankAccount.String
	inv.Title = &t

	app, err := GetApplicationByID(inv.ApplicationID)
	if err != nil {
		return nil, err
	}
	inv.Application = app

	return &inv, nil
}

func GetInvoiceByNumber(invoiceNumber string) (*models.Invoice, error) {
	query := "SELECT id, application_id, title_id, invoice_number FROM invoices WHERE invoice_number = ?"
	row := db.DB.QueryRow(query, invoiceNumber)

	var inv models.Invoice
	err := row.Scan(&inv.ID, &inv.ApplicationID, &inv.TitleID, &inv.InvoiceNumber)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &inv, nil
}

func CheckTitleHasApplications(titleID uint64) (bool, error) {
	query := "SELECT COUNT(*) FROM invoice_applications WHERE title_id = ?"
	var count int
	err := db.DB.QueryRow(query, titleID).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func CheckTitleHasInvoices(titleID uint64) (bool, error) {
	query := "SELECT COUNT(*) FROM invoices WHERE title_id = ?"
	var count int
	err := db.DB.QueryRow(query, titleID).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func GetStatistics() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	var totalTitles int
	db.DB.QueryRow("SELECT COUNT(*) FROM titles").Scan(&totalTitles)
	stats["total_titles"] = totalTitles

	type StatusCount struct {
		Status int
		Count  int
	}
	rows, _ := db.DB.Query("SELECT status, COUNT(*) as count FROM invoice_applications GROUP BY status")
	defer rows.Close()
	statusCounts := make(map[int]int)
	for rows.Next() {
		var sc StatusCount
		rows.Scan(&sc.Status, &sc.Count)
		statusCounts[sc.Status] = sc.Count
	}
	stats["status_counts"] = statusCounts

	var totalApplications int
	db.DB.QueryRow("SELECT COUNT(*) FROM invoice_applications").Scan(&totalApplications)
	stats["total_applications"] = totalApplications

	var totalInvoices int
	db.DB.QueryRow("SELECT COUNT(*) FROM invoices").Scan(&totalInvoices)
	stats["total_invoices"] = totalInvoices

	var totalAmount float64
	db.DB.QueryRow("SELECT COALESCE(SUM(total_amount), 0) FROM invoices").Scan(&totalAmount)
	stats["total_invoice_amount"] = totalAmount

	return stats, nil
}

func ValidateTaxNumber(taxNumber string) bool {
	cleaned := strings.ReplaceAll(taxNumber, "-", "")
	cleaned = strings.ReplaceAll(cleaned, " ", "")
	if len(cleaned) == 15 || len(cleaned) == 17 || len(cleaned) == 18 || len(cleaned) == 20 {
		for _, c := range cleaned {
			if !((c >= '0' && c <= '9') || (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z')) {
				return false
			}
		}
		return true
	}
	return false
}

func nullStr(s string) sql.NullString {
	if s == "" {
		return sql.NullString{}
	}
	return sql.NullString{String: s, Valid: true}
}

func statusText(status int) string {
	switch status {
	case 1:
		return "待审核"
	case 2:
		return "已通过"
	case 3:
		return "已驳回"
	case 4:
		return "已开票"
	default:
		return fmt.Sprintf("未知(%d)", status)
	}
}