package services

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"restaurant-queue/database"
	"restaurant-queue/models"
	"time"
)

type ReservationService struct{}

func NewReservationService() *ReservationService {
	return &ReservationService{}
}

func generateVerifyCode() string {
	b := make([]byte, 4)
	rand.Read(b)
	return fmt.Sprintf("%06d", uint32(b[0])<<24|uint32(b[1])<<16|uint32(b[2])<<8|uint32(b[3])%1000000)
}

func generateReserveNo(userID uint64) string {
	b := make([]byte, 8)
	rand.Read(b)
	return "R" + hex.EncodeToString(b)[:16]
}

func (s *ReservationService) Create(reservation *models.Reservation, settings *models.QueueSetting) error {
	reserveDate, err := time.Parse("2006-01-02", reservation.ReserveDate)
	if err != nil {
		return errors.New("日期格式错误")
	}

	maxDate := time.Now().AddDate(0, 0, settings.MaxAdvanceDays)
	if reserveDate.After(maxDate) {
		return fmt.Errorf("最多只能提前%d天预约", settings.MaxAdvanceDays)
	}

	if reserveDate.Format("2006-01-02") < time.Now().Format("2006-01-02") {
		return errors.New("不能预约过去的日期")
	}

	var count int64
	database.DB.Model(&models.Reservation{}).Where(
		"user_id = ? AND restaurant_id = ? AND reserve_date = ? AND status IN (0,1)",
		reservation.UserID, reservation.RestaurantID, reservation.ReserveDate,
	).Count(&count)

	if count >= 2 {
		return errors.New("同一天同一餐厅最多预约2次")
	}

	reservation.ReserveNo = generateReserveNo(reservation.UserID)
	reservation.VerifyCode = generateVerifyCode()
	reservation.Status = models.ReservationStatusConfirmed

	return database.DB.Create(reservation).Error
}

func (s *ReservationService) Verify(reservationID uint64, verifyCode string, operatorID *uint64) (*models.Queue, *models.Reservation, error) {
	var reservation models.Reservation
	if err := database.DB.First(&reservation, reservationID).Error; err != nil {
		return nil, nil, errors.New("预约不存在")
	}

	verifyType := models.VerifyTypeReservation
	var verifyResult int8 = models.VerifyResultFailed
	var remark string

	defer func() {
		record := &models.VerifyRecord{
			RestaurantID:  reservation.RestaurantID,
			ReservationID: reservation.ID,
			UserID:        reservation.UserID,
			VerifyCode:    verifyCode,
			VerifyType:    int8(verifyType),
			VerifyResult:  verifyResult,
			OperatorID:    operatorID,
			Remark:        remark,
		}
		database.DB.Create(record)
	}()

	if reservation.Status != models.ReservationStatusConfirmed {
		remark = "预约状态无效"
		return nil, nil, errors.New(remark)
	}

	if reservation.VerifyCode != verifyCode {
		remark = "核验码错误"
		return nil, nil, errors.New(remark)
	}

	reserveDateTime := fmt.Sprintf("%s %s", reservation.ReserveDate, reservation.ReserveTime)
	reserveTime, _ := time.ParseInLocation("2006-01-02 15:04:05", reserveDateTime, time.Local)
	now := time.Now()

	if now.Before(reserveTime.Add(-30 * time.Minute)) {
		remark = "未到核验时间，请提前30分钟内核验"
		return nil, nil, errors.New(remark)
	}

	if now.After(reserveTime.Add(30 * time.Minute)) {
		remark = "预约已过期"
		reservation.Status = models.ReservationStatusExpired
		database.DB.Save(&reservation)
		return nil, nil, errors.New(remark)
	}

	var tableType models.TableType
	if err := database.DB.First(&tableType, reservation.TableTypeID).Error; err != nil {
		remark = "桌型不存在"
		return nil, nil, errors.New(remark)
	}

	var settings models.QueueSetting
	database.DB.Where("restaurant_id = ?", reservation.RestaurantID).First(&settings)

	queue := &models.Queue{
		RestaurantID:  reservation.RestaurantID,
		TableTypeID:   reservation.TableTypeID,
		QueuePrefix:   tableType.QueuePrefix,
		UserID:        reservation.UserID,
		UserPhone:     reservation.UserPhone,
		PeopleCount:   reservation.PeopleCount,
		IsReservation: 1,
		ReservationID: &reservation.ID,
	}

	queueService := NewQueueService()
	if err := queueService.Enqueue(queue, &settings, &tableType); err != nil {
		remark = "排队失败: " + err.Error()
		return nil, nil, errors.New(remark)
	}

	nowTime := time.Now()
	reservation.Status = models.ReservationStatusCompleted
	reservation.QueueID = &queue.ID
	reservation.VerifiedAt = &nowTime

	if err := database.DB.Save(&reservation).Error; err != nil {
		remark = "更新预约状态失败"
		return nil, nil, errors.New(remark)
	}

	verifyResult = models.VerifyResultSuccess
	remark = "核验成功"

	return queue, &reservation, nil
}

func (s *ReservationService) Cancel(reservationID uint64, userID uint64) error {
	var reservation models.Reservation
	if err := database.DB.First(&reservation, reservationID).Error; err != nil {
		return errors.New("预约不存在")
	}

	if reservation.UserID != userID {
		return errors.New("无权限取消")
	}

	if reservation.Status != models.ReservationStatusPending && reservation.Status != models.ReservationStatusConfirmed {
		return errors.New("当前状态不能取消")
	}

	reserveDateTime := fmt.Sprintf("%s %s", reservation.ReserveDate, reservation.ReserveTime)
	reserveTime, _ := time.ParseInLocation("2006-01-02 15:04:05", reserveDateTime, time.Local)

	if time.Now().After(reserveTime.Add(-30 * time.Minute)) {
		return errors.New("预约前30分钟内不能取消")
	}

	reservation.Status = models.ReservationStatusCancelled
	return database.DB.Save(&reservation).Error
}

func (s *ReservationService) GetUserReservations(userID uint64, status *int8) ([]models.Reservation, error) {
	var reservations []models.Reservation
	query := database.DB.Where("user_id = ?", userID)

	if status != nil {
		query = query.Where("status = ?", *status)
	}

	err := query.Order("id DESC").Find(&reservations).Error
	return reservations, err
}

func (s *ReservationService) GetAvailableTimeSlots(restaurantID uint64, tableTypeID uint64, date string, gapMinutes int) ([]map[string]interface{}, error) {
	targetDate, err := time.Parse("2006-01-02", date)
	if err != nil {
		return nil, errors.New("日期格式错误")
	}

	var existingReservations []models.Reservation
	database.DB.Where(
		"restaurant_id = ? AND table_type_id = ? AND reserve_date = ? AND status IN (0,1)",
		restaurantID, tableTypeID, date,
	).Find(&existingReservations)

	reservedTimes := make(map[string]int)
	for _, r := range existingReservations {
		reservedTimes[r.ReserveTime]++
	}

	var tableType models.TableType
	database.DB.First(&tableType, tableTypeID)

	slots := make([]map[string]interface{}, 0)
	startHour, endHour := 11, 22

	for hour := startHour; hour < endHour; hour++ {
		for minute := 0; minute < 60; minute += gapMinutes {
			timeStr := fmt.Sprintf("%02d:%02d:00", hour, minute)

			slotTime := time.Date(targetDate.Year(), targetDate.Month(), targetDate.Day(), hour, minute, 0, 0, time.Local)
			isPast := slotTime.Before(time.Now())

			reservedCount := reservedTimes[timeStr]
			available := tableType.TotalTables/2 - reservedCount

			slot := map[string]interface{}{
				"time":      timeStr[:5],
				"available": available > 0 && !isPast,
				"reserved":  reservedCount,
				"is_past":   isPast,
			}
			slots = append(slots, slot)
		}
	}

	return slots, nil
}
