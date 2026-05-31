package handlers

import (
	"net/http"
	"restaurant-queue/database"
	"restaurant-queue/models"
	"restaurant-queue/services"
	"restaurant-queue/websocket"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: "success",
		Data:    data,
	})
}

func Fail(c *gin.Context, code int, message string) {
	c.JSON(http.StatusOK, Response{
		Code:    code,
		Message: message,
		Data:    nil,
	})
}

func GetRestaurants(c *gin.Context) {
	var restaurants []models.Restaurant
	database.DB.Where("status = 1").Find(&restaurants)
	Success(c, restaurants)
}

func GetRestaurantDetail(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var restaurant models.Restaurant
	if err := database.DB.First(&restaurant, id).Error; err != nil {
		Fail(c, 404, "餐厅不存在")
		return
	}

	var tableTypes []models.TableType
	database.DB.Where("restaurant_id = ? AND status = 1", id).Order("sort_order ASC").Find(&tableTypes)

	var settings models.QueueSetting
	database.DB.Where("restaurant_id = ?", id).First(&settings)

	queueService := services.NewQueueService()
	queueInfo := make(map[string]interface{})
	for _, tt := range tableTypes {
		length, _ := queueService.GetQueueLength(id, tt.QueuePrefix)
		queueInfo[tt.QueuePrefix] = map[string]interface{}{
			"name":   tt.Name,
			"length": length,
		}
	}

	Success(c, gin.H{
		"restaurant":  restaurant,
		"table_types": tableTypes,
		"settings":     settings,
		"queue_info":   queueInfo,
	})
}

func GetTableTypes(c *gin.Context) {
	restaurantID, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var tableTypes []models.TableType
	database.DB.Where("restaurant_id = ? AND status = 1", restaurantID).Order("sort_order ASC").Find(&tableTypes)

	queueService := services.NewQueueService()
	result := make([]map[string]interface{}, 0)
	for _, tt := range tableTypes {
		length, _ := queueService.GetQueueLength(restaurantID, tt.QueuePrefix)
		result = append(result, map[string]interface{}{
			"id":              tt.ID,
			"name":             tt.Name,
			"min_people":      tt.MinPeople,
			"max_people":      tt.MaxPeople,
			"seat_count":       tt.SeatCount,
			"queue_prefix":    tt.QueuePrefix,
			"total_tables":     tt.TotalTables,
			"avg_serve_time":  tt.AvgServeTime,
			"queue_length":    length,
		})
	}

	Success(c, result)
}

type QueueRequest struct {
	RestaurantID uint64 `json:"restaurant_id" binding:"required"`
	TableTypeID  uint64 `json:"table_type_id" binding:"required"`
	UserID       uint64 `json:"user_id" binding:"required"`
	UserPhone    string `json:"user_phone" binding:"required"`
	PeopleCount  int    `json:"people_count" binding:"required,min=1"`
}

func CreateQueue(c *gin.Context) {
	var req QueueRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Fail(c, 400, "参数错误: "+err.Error())
		return
	}

	var settings models.QueueSetting
	if err := database.DB.Where("restaurant_id = ?", req.RestaurantID).First(&settings).Error; err != nil {
		Fail(c, 404, "餐厅不存在")
		return
	}

	var tableType models.TableType
	if err := database.DB.First(&tableType, req.TableTypeID).Error; err != nil {
		Fail(c, 404, "桌型不存在")
		return
	}

	if tableType.RestaurantID != req.RestaurantID {
		Fail(c, 400, "桌型不属于该餐厅")
		return
	}

	if req.PeopleCount < tableType.MinPeople || req.PeopleCount > tableType.MaxPeople {
		Fail(c, 400, "人数不符合桌型要求")
		return
	}

	queue := &models.Queue{
		RestaurantID: req.RestaurantID,
		TableTypeID:  req.TableTypeID,
		QueuePrefix: tableType.QueuePrefix,
		UserID:       req.UserID,
		UserPhone:    req.UserPhone,
		PeopleCount:  req.PeopleCount,
	}

	queueService := services.NewQueueService()
	if err := queueService.Enqueue(queue, &settings, &tableType); err != nil {
		Fail(c, 500, err.Error())
		return
	}

	websocket.WsHub.SendToRestaurant(req.RestaurantID, &websocket.Message{
		Type: "queue_update",
		Data: gin.H{
			"action": "new_queue",
			"queue":   queue,
		},
	})

	Success(c, queue)
}

func GetQueueInfo(c *gin.Context) {
	queueID, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	queueService := services.NewQueueService()
	queue, err := queueService.GetQueueInfo(queueID)
	if err != nil {
		Fail(c, 404, "排队记录不存在")
		return
	}

	Success(c, queue)
}

func GetUserQueues(c *gin.Context) {
	userID, _ := strconv.ParseUint(c.Param("user_id"), 10, 64)

	queueService := services.NewQueueService()
	queues, err := queueService.GetUserQueues(userID)
	if err != nil {
		Fail(c, 500, err.Error())
		return
	}

	Success(c, queues)
}

func CancelQueue(c *gin.Context) {
	queueID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	userID, _ := strconv.ParseUint(c.Query("user_id"), 10, 64)

	queueService := services.NewQueueService()
	queue, err := queueService.CancelQueue(queueID)
	if err != nil {
		Fail(c, 500, err.Error())
		return
	}

	if queue.UserID != userID {
		Fail(c, 403, "无权限取消")
		return
	}

	websocket.WsHub.SendToRestaurant(queue.RestaurantID, &websocket.Message{
		Type: "queue_update",
		Data: gin.H{
			"action": "cancel_queue",
			"queue":   queue,
		},
	})

	Success(c, queue)
}

type CallQueueRequest struct {
	RestaurantID uint64 `json:"restaurant_id" binding:"required"`
	TableTypeID  uint64 `json:"table_type_id" binding:"required"`
	QueuePrefix  string `json:"queue_prefix" binding:"required"`
}

func CallQueue(c *gin.Context) {
	var req CallQueueRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Fail(c, 400, "参数错误")
		return
	}

	queueService := services.NewQueueService()
	queue, err := queueService.Dequeue(req.RestaurantID, req.QueuePrefix)
	if err != nil {
		Fail(c, 500, err.Error())
		return
	}

	websocket.WsHub.SendToRestaurant(req.RestaurantID, &websocket.Message{
		Type: "queue_update",
		Data: gin.H{
			"action": "call_queue",
			"queue":   queue,
		},
	})

	websocket.WsHub.SendToUser(queue.UserID, &websocket.Message{
		Type: "call_notify",
		Data: gin.H{
			"queue": queue,
		},
	})

	Success(c, queue)
}

func GetCalledQueues(c *gin.Context) {
	restaurantID, _ := strconv.ParseUint(c.Param("restaurant_id"), 10, 64)
	count, _ := strconv.ParseInt(c.DefaultQuery("count", "10"), 10, 64)

	queueService := services.NewQueueService()
	queues, err := queueService.GetCalledQueue(restaurantID, count)
	if err != nil {
		Fail(c, 500, err.Error())
		return
	}

	Success(c, queues)
}

func GetWaitingQueues(c *gin.Context) {
	restaurantID, _ := strconv.ParseUint(c.Param("restaurant_id"), 10, 64)
	prefix := c.Param("prefix")

	queueService := services.NewQueueService()
	ids, err := queueService.GetWaitingQueue(restaurantID, prefix)
	if err != nil {
		Fail(c, 500, err.Error())
		return
	}

	var queues []models.Queue
	if len(ids) > 0 {
		database.DB.Where("id IN (?)", ids).Find(&queues)
	}

	Success(c, queues)
}

type OverQueueRequest struct {
	QueueID uint64 `json:"queue_id" binding:"required"`
}

func MarkOverQueue(c *gin.Context) {
	var req OverQueueRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Fail(c, 400, "参数错误")
		return
	}

	var queue models.Queue
	database.DB.First(&queue, req.QueueID)

	var settings models.QueueSetting
	database.DB.Where("restaurant_id = ?", queue.RestaurantID).First(&settings)

	queueService := services.NewQueueService()
	result, err := queueService.MarkOver(req.QueueID, &settings)
	if err != nil {
		Fail(c, 500, err.Error())
		return
	}

	websocket.WsHub.SendToRestaurant(queue.RestaurantID, &websocket.Message{
		Type: "queue_update",
		Data: gin.H{
			"action": "over_queue",
			"queue":   result,
		},
	})

	Success(c, result)
}

func MarkSeatedQueue(c *gin.Context) {
	var req OverQueueRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Fail(c, 400, "参数错误")
		return
	}

	queueService := services.NewQueueService()
	queue, err := queueService.MarkSeated(req.QueueID)
	if err != nil {
		Fail(c, 500, err.Error())
		return
	}

	websocket.WsHub.SendToRestaurant(queue.RestaurantID, &websocket.Message{
		Type: "queue_update",
		Data: gin.H{
			"action": "seated_queue",
			"queue":   queue,
		},
	})

	Success(c, queue)
}

func MarkCompletedQueue(c *gin.Context) {
	var req OverQueueRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Fail(c, 400, "参数错误")
		return
	}

	queueService := services.NewQueueService()
	queue, err := queueService.MarkCompleted(req.QueueID)
	if err != nil {
		Fail(c, 500, err.Error())
		return
	}

	Success(c, queue)
}

type ReservationRequest struct {
	RestaurantID uint64 `json:"restaurant_id" binding:"required"`
	TableTypeID  uint64 `json:"table_type_id" binding:"required"`
	UserID       uint64 `json:"user_id" binding:"required"`
	UserPhone    string `json:"user_phone" binding:"required"`
	PeopleCount  int    `json:"people_count" binding:"required,min=1"`
	ReserveDate  string `json:"reserve_date" binding:"required"`
	ReserveTime  string `json:"reserve_time" binding:"required"`
}

func CreateReservation(c *gin.Context) {
	var req ReservationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Fail(c, 400, "参数错误: "+err.Error())
		return
	}

	var settings models.QueueSetting
	if err := database.DB.Where("restaurant_id = ?", req.RestaurantID).First(&settings).Error; err != nil {
		Fail(c, 404, "餐厅不存在")
		return
	}

	var tableType models.TableType
	if err := database.DB.First(&tableType, req.TableTypeID).Error; err != nil {
		Fail(c, 404, "桌型不存在")
		return
	}

	reservation := &models.Reservation{
		RestaurantID: req.RestaurantID,
		TableTypeID:  req.TableTypeID,
		UserID:       req.UserID,
		UserPhone:    req.UserPhone,
		PeopleCount:  req.PeopleCount,
		ReserveDate:  req.ReserveDate,
		ReserveTime:  req.ReserveTime,
	}

	reservationService := services.NewReservationService()
	if err := reservationService.Create(reservation, &settings); err != nil {
		Fail(c, 500, err.Error())
		return
	}

	Success(c, reservation)
}

func GetUserReservations(c *gin.Context) {
	userID, _ := strconv.ParseUint(c.Param("user_id"), 10, 64)
	statusStr := c.Query("status")

	var status *int8
	if statusStr != "" {
		s, _ := strconv.ParseInt(statusStr, 10, 8)
		s8 := int8(s)
		status = &s8
	}

	reservationService := services.NewReservationService()
	reservations, err := reservationService.GetUserReservations(userID, status)
	if err != nil {
		Fail(c, 500, err.Error())
		return
	}

	Success(c, reservations)
}

func CancelReservation(c *gin.Context) {
	reservationID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	userID, _ := strconv.ParseUint(c.Query("user_id"), 10, 64)

	reservationService := services.NewReservationService()
	if err := reservationService.Cancel(reservationID, userID); err != nil {
		Fail(c, 500, err.Error())
		return
	}

	Success(c, gin.H{"message": "取消成功"})
}

func GetAvailableTimeSlots(c *gin.Context) {
	restaurantID, _ := strconv.ParseUint(c.Param("restaurant_id"), 10, 64)
	tableTypeID, _ := strconv.ParseUint(c.Param("table_type_id"), 10, 64)
	date := c.Query("date")

	var settings models.QueueSetting
	database.DB.Where("restaurant_id = ?", restaurantID).First(&settings)

	reservationService := services.NewReservationService()
	slots, err := reservationService.GetAvailableTimeSlots(restaurantID, tableTypeID, date, settings.ReserveTimeGap)
	if err != nil {
		Fail(c, 500, err.Error())
		return
	}

	Success(c, slots)
}

type VerifyRequest struct {
	ReservationID uint64 `json:"reservation_id" binding:"required"`
	VerifyCode     string `json:"verify_code" binding:"required"`
	OperatorID     *uint64 `json:"operator_id"`
}

func VerifyReservation(c *gin.Context) {
	var req VerifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Fail(c, 400, "参数错误")
		return
	}

	reservationService := services.NewReservationService()
	queue, reservation, err := reservationService.Verify(req.ReservationID, req.VerifyCode, req.OperatorID)
	if err != nil {
		Fail(c, 500, err.Error())
		return
	}

	if queue != nil {
		websocket.WsHub.SendToRestaurant(reservation.RestaurantID, &websocket.Message{
			Type: "queue_update",
			Data: gin.H{
				"action": "new_queue",
				"queue":   queue,
			},
		})
	}

	Success(c, gin.H{
		"queue":       queue,
		"reservation": reservation,
	})
}

func LoginOrRegister(c *gin.Context) {
	phone := c.PostForm("phone")
	if phone == "" {
		Fail(c, 400, "手机号不能为空")
		return
	}

	var user models.User
	err := database.DB.Where("phone = ?", phone).First(&user).Error
	if err != nil {
		user = models.User{
			Phone:    phone,
			Nickname: "用户" + phone[len(phone)-4:],
			Status:   1,
		}
		database.DB.Create(&user)
	}

	Success(c, user)
}

func GetUserInfo(c *gin.Context) {
	userID, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		Fail(c, 404, "用户不存在")
		return
	}

	Success(c, user)
}
