package handlers

import (
	"database/sql"
	"strconv"

	"online-repair-booking/internal/middleware"
	"online-repair-booking/internal/models"
	"online-repair-booking/pkg/response"

	"github.com/labstack/echo/v4"
)

type AddressHandler struct {
	addressModel *models.AddressModel
}

func NewAddressHandler(db *sql.DB) *AddressHandler {
	return &AddressHandler{
		addressModel: models.NewAddressModel(db),
	}
}

type CreateAddressRequest struct {
	Name      string  `json:"name"`
	Phone     string  `json:"phone"`
	Province  string  `json:"province"`
	City      string  `json:"city"`
	District  string  `json:"district"`
	Detail    string  `json:"detail"`
	Longitude float64 `json:"longitude"`
	Latitude  float64 `json:"latitude"`
	IsDefault int     `json:"is_default"`
	Tag       string  `json:"tag"`
}

func (h *AddressHandler) CreateAddress(c echo.Context) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "请先登录")
	}

	req := new(CreateAddressRequest)
	if err := c.Bind(req); err != nil {
		return response.BadRequest(c, "请求参数错误")
	}

	if req.Name == "" || req.Phone == "" || req.Detail == "" {
		return response.BadRequest(c, "姓名、手机号和详细地址不能为空")
	}

	fullAddress := req.Province + req.City + req.District + req.Detail

	address := &models.Address{
		UserID:      userID,
		Name:        req.Name,
		Phone:       req.Phone,
		Province:    req.Province,
		City:        req.City,
		District:    req.District,
		Detail:      req.Detail,
		FullAddress: fullAddress,
		Longitude:   req.Longitude,
		Latitude:    req.Latitude,
		IsDefault:   req.IsDefault,
		Tag:         req.Tag,
	}

	if err := h.addressModel.Create(address); err != nil {
		return response.InternalServerError(c, "创建地址失败")
	}

	return response.Success(c, address)
}

func (h *AddressHandler) GetAddressList(c echo.Context) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "请先登录")
	}

	addresses, err := h.addressModel.ListByUserID(userID)
	if err != nil {
		return response.InternalServerError(c, "获取地址列表失败")
	}

	return response.Success(c, addresses)
}

type UpdateAddressRequest struct {
	Name      string  `json:"name"`
	Phone     string  `json:"phone"`
	Province  string  `json:"province"`
	City      string  `json:"city"`
	District  string  `json:"district"`
	Detail    string  `json:"detail"`
	Longitude float64 `json:"longitude"`
	Latitude  float64 `json:"latitude"`
	IsDefault int     `json:"is_default"`
	Tag       string  `json:"tag"`
}

func (h *AddressHandler) UpdateAddress(c echo.Context) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "请先登录")
	}

	idStr := c.Param("id")
	if idStr == "" {
		return response.BadRequest(c, "地址ID不能为空")
	}

	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		return response.BadRequest(c, "地址ID格式错误")
	}

	address, err := h.addressModel.GetByID(id)
	if err != nil {
		return response.NotFound(c, "地址不存在")
	}

	if address.UserID != userID {
		return response.Forbidden(c, "您无权修改该地址")
	}

	req := new(UpdateAddressRequest)
	if err := c.Bind(req); err != nil {
		return response.BadRequest(c, "请求参数错误")
	}

	if req.Name != "" {
		address.Name = req.Name
	}
	if req.Phone != "" {
		address.Phone = req.Phone
	}
	if req.Province != "" {
		address.Province = req.Province
	}
	if req.City != "" {
		address.City = req.City
	}
	if req.District != "" {
		address.District = req.District
	}
	if req.Detail != "" {
		address.Detail = req.Detail
	}
	if req.Longitude != 0 {
		address.Longitude = req.Longitude
	}
	if req.Latitude != 0 {
		address.Latitude = req.Latitude
	}
	if req.IsDefault != 0 {
		address.IsDefault = req.IsDefault
	}
	if req.Tag != "" {
		address.Tag = req.Tag
	}

	address.FullAddress = address.Province + address.City + address.District + address.Detail

	if err := h.addressModel.Update(address); err != nil {
		return response.InternalServerError(c, "更新地址失败")
	}

	return response.Success(c, address)
}

func (h *AddressHandler) DeleteAddress(c echo.Context) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "请先登录")
	}

	idStr := c.Param("id")
	if idStr == "" {
		return response.BadRequest(c, "地址ID不能为空")
	}

	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		return response.BadRequest(c, "地址ID格式错误")
	}

	address, err := h.addressModel.GetByID(id)
	if err != nil {
		return response.NotFound(c, "地址不存在")
	}

	if address.UserID != userID {
		return response.Forbidden(c, "您无权删除该地址")
	}

	if err := h.addressModel.Delete(id); err != nil {
		return response.InternalServerError(c, "删除地址失败")
	}

	return response.SuccessWithMessage(c, "删除成功", nil)
}

func (h *AddressHandler) SetDefaultAddress(c echo.Context) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "请先登录")
	}

	idStr := c.Param("id")
	if idStr == "" {
		return response.BadRequest(c, "地址ID不能为空")
	}

	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		return response.BadRequest(c, "地址ID格式错误")
	}

	address, err := h.addressModel.GetByID(id)
	if err != nil {
		return response.NotFound(c, "地址不存在")
	}

	if address.UserID != userID {
		return response.Forbidden(c, "您无权修改该地址")
	}

	if err := h.addressModel.SetDefault(id, userID); err != nil {
		return response.InternalServerError(c, "设置默认地址失败")
	}

	return response.SuccessWithMessage(c, "设置成功", nil)
}
