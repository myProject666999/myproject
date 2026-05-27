package handlers

import (
	"database/sql"
	"log"
	"strconv"
	"strings"
	"time"

	"online-repair-booking/internal/models"
	"online-repair-booking/pkg/database"
	"online-repair-booking/pkg/response"

	"github.com/labstack/echo/v4"
)

type ServiceHandler struct {
	categoryModel *models.ServiceCategoryModel
	serviceModel  *models.ServiceModel
	timeSlotModel *models.TimeSlotModel
}

func NewServiceHandler(db *sql.DB) *ServiceHandler {
	return &ServiceHandler{
		categoryModel: models.NewServiceCategoryModel(db),
		serviceModel:  models.NewServiceModel(db),
		timeSlotModel: models.NewTimeSlotModel(db),
	}
}

type ServiceCategoryWithChildren struct {
	ID          uint64                        `json:"id"`
	Name        string                        `json:"name"`
	Icon        string                        `json:"icon"`
	Description string                        `json:"description"`
	Sort        int                           `json:"sort"`
	Children    []*ServiceCategoryWithChildren `json:"children"`
}

type PaginationResult struct {
	List     interface{} `json:"list"`
	Total    int64       `json:"total"`
	Page     int         `json:"page"`
	PageSize int         `json:"page_size"`
}

func (h *ServiceHandler) GetCategoryList(c echo.Context) error {
	query := `SELECT id, name, icon, description, parent_id, sort FROM service_categories WHERE status = 1 ORDER BY sort ASC, id ASC`
	rows, err := database.MySQL.Query(query)
	if err != nil {
		log.Printf("Error querying categories: %v", err)
		return response.InternalServerError(c, "获取分类列表失败")
	}
	defer rows.Close()

	categoryMap := make(map[uint64]*ServiceCategoryWithChildren)
	rootCategories := make([]*ServiceCategoryWithChildren, 0)

	for rows.Next() {
		var id, parentID uint64
		var name string
		var icon, description sql.NullString
		var sort int
		err := rows.Scan(&id, &name, &icon, &description, &parentID, &sort)
		if err != nil {
			return response.InternalServerError(c, "解析分类数据失败: "+err.Error())
		}

		category := &ServiceCategoryWithChildren{
			ID:          id,
			Name:        name,
			Sort:        sort,
			Children:    make([]*ServiceCategoryWithChildren, 0),
		}
		if icon.Valid {
			category.Icon = icon.String
		}
		if description.Valid {
			category.Description = description.String
		}
		categoryMap[id] = category

		if parentID == 0 {
			rootCategories = append(rootCategories, category)
		} else {
			if parent, ok := categoryMap[parentID]; ok {
				parent.Children = append(parent.Children, category)
			}
		}
	}

	return response.Success(c, rootCategories)
}

func (h *ServiceHandler) GetServiceList(c echo.Context) error {
	categoryIDStr := c.QueryParam("category_id")
	categoryIDStr2 := c.QueryParam("categoryId")
	if categoryIDStr == "" && categoryIDStr2 != "" {
		categoryIDStr = categoryIDStr2
	}
	pageStr := c.QueryParam("page")
	pageSizeStr := c.QueryParam("page_size")
	pageSizeStr2 := c.QueryParam("pageSize")
	if pageSizeStr == "" && pageSizeStr2 != "" {
		pageSizeStr = pageSizeStr2
	}

	page := 1
	if pageStr != "" {
		page, _ = strconv.Atoi(pageStr)
	}
	if page < 1 {
		page = 1
	}

	pageSize := 10
	if pageSizeStr != "" {
		pageSize, _ = strconv.Atoi(pageSizeStr)
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	whereConditions := make([]string, 0)
	args := make([]interface{}, 0)
	whereConditions = append(whereConditions, "s.status = 1")

	if categoryIDStr != "" {
		categoryID, err := strconv.ParseUint(categoryIDStr, 10, 64)
		if err == nil {
			whereConditions = append(whereConditions, "s.category_id = ?")
			args = append(args, categoryID)
		}
	}

	whereClause := " WHERE " + strings.Join(whereConditions, " AND ")

	var total int64
	countQuery := `SELECT COUNT(*) FROM services s` + whereClause
	err := database.MySQL.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return response.InternalServerError(c, "获取服务总数失败")
	}

	offset := (page - 1) * pageSize
	query := `SELECT s.id, s.category_id, s.name, s.description, s.price, s.price_unit, s.image, s.duration, s.sort 
	          FROM services s` + whereClause + `
	          ORDER BY s.sort ASC, s.id DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)
	rows, err := database.MySQL.Query(query, args...)
	if err != nil {
		return response.InternalServerError(c, "获取服务列表失败")
	}
	defer rows.Close()

	type ServiceItem struct {
		ID          uint64  `json:"id"`
		CategoryID  uint64  `json:"category_id"`
		Name        string  `json:"name"`
		Description string  `json:"description"`
		Price       float64 `json:"price"`
		PriceUnit   string  `json:"price_unit"`
		Image       string  `json:"image"`
		Duration    int     `json:"duration"`
		Sort        int     `json:"sort"`
	}

	services := make([]*ServiceItem, 0)
	for rows.Next() {
		service := &ServiceItem{}
		err := rows.Scan(&service.ID, &service.CategoryID, &service.Name, &service.Description,
			&service.Price, &service.PriceUnit, &service.Image, &service.Duration, &service.Sort)
		if err != nil {
			return response.InternalServerError(c, "解析服务数据失败")
		}
		services = append(services, service)
	}

	result := &PaginationResult{
		List:     services,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}

	return response.Success(c, result)
}

func (h *ServiceHandler) GetServiceDetail(c echo.Context) error {
	idStr := c.Param("id")
	if idStr == "" {
		return response.BadRequest(c, "服务ID不能为空")
	}

	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		return response.BadRequest(c, "服务ID格式错误")
	}

	query := `SELECT s.id, s.category_id, s.name, s.description, s.price, s.price_unit, 
	          s.image, s.duration, sc.name as category_name 
	          FROM services s 
	          LEFT JOIN service_categories sc ON s.category_id = sc.id 
	          WHERE s.id = ? AND s.status = 1`
	
	type ServiceDetail struct {
		ID           uint64  `json:"id"`
		CategoryID   uint64  `json:"category_id"`
		CategoryName string  `json:"category_name"`
		Name         string  `json:"name"`
		Description  string  `json:"description"`
		Price        float64 `json:"price"`
		PriceUnit    string  `json:"price_unit"`
		Image        string  `json:"image"`
		Duration     int     `json:"duration"`
	}

	service := &ServiceDetail{}
	var description, image sql.NullString
	err = database.MySQL.QueryRow(query, id).Scan(&service.ID, &service.CategoryID, &service.Name,
		&description, &service.Price, &service.PriceUnit, &image, &service.Duration, &service.CategoryName)
	if err != nil {
		if err == sql.ErrNoRows {
			return response.NotFound(c, "服务不存在")
		}
		log.Printf("Error getting service detail: %v", err)
		return response.InternalServerError(c, "获取服务详情失败")
	}
	if description.Valid {
		service.Description = description.String
	}
	if image.Valid {
		service.Image = image.String
	}

	return response.Success(c, service)
}

func (h *ServiceHandler) GetTimeSlots(c echo.Context) error {
	workerIDStr := c.QueryParam("worker_id")
	dateStr := c.QueryParam("date")

	if workerIDStr == "" {
		return response.BadRequest(c, "师傅ID不能为空")
	}
	if dateStr == "" {
		return response.BadRequest(c, "日期不能为空")
	}

	workerID, err := strconv.ParseUint(workerIDStr, 10, 64)
	if err != nil {
		return response.BadRequest(c, "师傅ID格式错误")
	}

	_, err = time.Parse("2006-01-02", dateStr)
	if err != nil {
		return response.BadRequest(c, "日期格式错误，请使用 YYYY-MM-DD")
	}

	query := `SELECT id, start_time, end_time, sort FROM time_slots WHERE status = 1 ORDER BY sort ASC`
	rows, err := database.MySQL.Query(query)
	if err != nil {
		return response.InternalServerError(c, "获取时段列表失败")
	}
	defer rows.Close()

	type TimeSlot struct {
		ID        uint64 `json:"id"`
		StartTime string `json:"start_time"`
		EndTime   string `json:"end_time"`
		IsBooked  bool   `json:"is_booked"`
	}

	slots := make([]*TimeSlot, 0)
	for rows.Next() {
		slot := &TimeSlot{}
		err := rows.Scan(&slot.ID, &slot.StartTime, &slot.EndTime, nil)
		if err != nil {
			return response.InternalServerError(c, "解析时段数据失败")
		}
		slots = append(slots, slot)
	}

	bookedQuery := `SELECT DISTINCT appointment_time FROM orders 
	                WHERE worker_id = ? AND appointment_date = ? AND status NOT IN (4, 5)`
	bookedRows, err := database.MySQL.Query(bookedQuery, workerID, dateStr)
	if err != nil {
		return response.InternalServerError(c, "获取已预约时段失败")
	}
	defer bookedRows.Close()

	bookedTimes := make(map[string]bool)
	for bookedRows.Next() {
		var timeSlot string
		err := bookedRows.Scan(&timeSlot)
		if err != nil {
			continue
		}
		bookedTimes[timeSlot] = true
	}

	for _, slot := range slots {
		timeRange := slot.StartTime + "-" + slot.EndTime
		slot.IsBooked = bookedTimes[timeRange]
	}

	return response.Success(c, slots)
}
