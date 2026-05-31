package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

type JSON json.RawMessage

func (j JSON) Value() (driver.Value, error) {
	if len(j) == 0 {
		return nil, nil
	}
	return json.RawMessage(j).MarshalJSON()
}

func (j *JSON) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	result := json.RawMessage{}
	err := json.Unmarshal(bytes, &result)
	*j = JSON(result)
	return err
}

type Employee struct {
	ID          int       `gorm:"primaryKey" json:"id"`
	EmployeeNo  string    `gorm:"unique;size:50" json:"employee_no"`
	Name        string    `gorm:"size:100" json:"name"`
	Department  string    `gorm:"size:100" json:"department"`
	Phone       string    `gorm:"size:20" json:"phone"`
	Email       string    `gorm:"size:100" json:"email"`
	FaceFeature string    `gorm:"type:text" json:"face_feature,omitempty"`
	QRSecret    string    `gorm:"size:255" json:"qr_secret,omitempty"`
	Status      int       `gorm:"default:1" json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (Employee) TableName() string {
	return "employees"
}

type Station struct {
	ID          int       `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"size:100" json:"name"`
	Address     string    `gorm:"size:255" json:"address"`
	Longitude   float64   `gorm:"type:decimal(10,7)" json:"longitude"`
	Latitude    float64   `gorm:"type:decimal(10,7)" json:"latitude"`
	Description string    `gorm:"size:500" json:"description"`
	Status      int       `gorm:"default:1" json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (Station) TableName() string {
	return "stations"
}

type Route struct {
	ID           int       `gorm:"primaryKey" json:"id"`
	RouteNo      string    `gorm:"unique;size:50" json:"route_no"`
	Name         string    `gorm:"size:100" json:"name"`
	Direction    int       `json:"direction"`
	Description  string    `gorm:"size:500" json:"description"`
	Distance     float64   `gorm:"type:decimal(8,2)" json:"distance"`
	EstimatedTime int      `json:"estimated_time"`
	Status       int       `gorm:"default:1" json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	Stations     []Station `gorm:"many2many:route_stations" json:"stations,omitempty"`
}

func (Route) TableName() string {
	return "routes"
}

type RouteStation struct {
	ID          int       `gorm:"primaryKey" json:"id"`
	RouteID     int       `json:"route_id"`
	StationID   int       `json:"station_id"`
	Sequence    int       `json:"sequence"`
	ArrivalTime string    `gorm:"type:time" json:"arrival_time"`
	CreatedAt   time.Time `json:"created_at"`
	Station     Station   `gorm:"foreignKey:StationID" json:"station,omitempty"`
}

func (RouteStation) TableName() string {
	return "route_stations"
}

type Shuttle struct {
	ID          int       `gorm:"primaryKey" json:"id"`
	PlateNo     string    `gorm:"unique;size:50" json:"plate_no"`
	Capacity    int       `json:"capacity"`
	Model       string    `gorm:"size:100" json:"model"`
	DriverName  string    `gorm:"size:50" json:"driver_name"`
	DriverPhone string    `gorm:"size:20" json:"driver_phone"`
	Status      int       `gorm:"default:1" json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (Shuttle) TableName() string {
	return "shuttles"
}

type Schedule struct {
	ID               int       `gorm:"primaryKey" json:"id"`
	ScheduleNo       string    `gorm:"unique;size:50" json:"schedule_no"`
	RouteID          int       `json:"route_id"`
	ShuttleID        int       `json:"shuttle_id"`
	DepartureDate    string    `gorm:"type:date" json:"departure_date"`
	DepartureTime    string    `gorm:"type:time" json:"departure_time"`
	Capacity         int       `json:"capacity"`
	BookedSeats      int       `gorm:"default:0" json:"booked_seats"`
	WarningThreshold float64   `gorm:"type:decimal(5,2);default:0.9" json:"warning_threshold"`
	Status           int       `gorm:"default:1" json:"status"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	Route            Route     `gorm:"foreignKey:RouteID" json:"route,omitempty"`
	Shuttle          Shuttle   `gorm:"foreignKey:ShuttleID" json:"shuttle,omitempty"`
}

func (Schedule) TableName() string {
	return "schedules"
}

type Reservation struct {
	ID             int       `gorm:"primaryKey" json:"id"`
	ReservationNo  string    `gorm:"unique;size:50" json:"reservation_no"`
	EmployeeID     int       `json:"employee_id"`
	ScheduleID     int       `json:"schedule_id"`
	BoardStationID int       `json:"board_station_id"`
	ExitStationID  int       `json:"exit_station_id,omitempty"`
	SeatNo         string    `gorm:"size:20" json:"seat_no,omitempty"`
	QRToken        string     `gorm:"size:255" json:"qr_token,omitempty"`
	QRExpireTime   *time.Time `json:"qr_expire_time,omitempty"`
	IsVerified     int        `gorm:"default:0" json:"is_verified"`
	VerifyTime     *time.Time `json:"verify_time,omitempty"`
	VerifyStationID int      `json:"verify_station_id,omitempty"`
	Status         int       `gorm:"default:1" json:"status"`
	CancelReason   string    `gorm:"size:500" json:"cancel_reason,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	Employee       Employee  `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
	Schedule       Schedule  `gorm:"foreignKey:ScheduleID" json:"schedule,omitempty"`
	BoardStation   Station   `gorm:"foreignKey:BoardStationID" json:"board_station,omitempty"`
}

func (Reservation) TableName() string {
	return "reservations"
}

type VerifyRecord struct {
	ID           int       `gorm:"primaryKey" json:"id"`
	ReservationID int      `json:"reservation_id"`
	EmployeeID   int       `json:"employee_id"`
	ScheduleID   int       `json:"schedule_id"`
	StationID    int       `json:"station_id"`
	VerifyType   int       `json:"verify_type"`
	VerifyTime   time.Time `json:"verify_time"`
	VerifyResult int       `json:"verify_result"`
	FailReason   string    `gorm:"size:500" json:"fail_reason,omitempty"`
	DeviceInfo   string    `gorm:"size:500" json:"device_info,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
}

func (VerifyRecord) TableName() string {
	return "verify_records"
}

type CapacityWarning struct {
	ID            int       `gorm:"primaryKey" json:"id"`
	ScheduleID    int       `json:"schedule_id"`
	WarningLevel  int       `json:"warning_level"`
	CurrentBooked int       `json:"current_booked"`
	Capacity      int       `json:"capacity"`
	WarningTime   time.Time `json:"warning_time"`
	IsHandled     int       `gorm:"default:0" json:"is_handled"`
	HandleNote    string    `gorm:"size:500" json:"handle_note,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
	Schedule      Schedule  `gorm:"foreignKey:ScheduleID" json:"schedule,omitempty"`
}

func (CapacityWarning) TableName() string {
	return "capacity_warnings"
}

type OptimizationSuggestion struct {
	ID              int       `gorm:"primaryKey" json:"id"`
	SuggestionType  int       `json:"suggestion_type"`
	Title           string    `gorm:"size:200" json:"title"`
	Content         string    `gorm:"type:text" json:"content"`
	AnalysisData    JSON      `gorm:"type:json" json:"analysis_data"`
	ConfidenceScore float64   `gorm:"type:decimal(5,2)" json:"confidence_score"`
	Status          int       `gorm:"default:0" json:"status"`
	StartDate       string    `gorm:"type:date" json:"start_date,omitempty"`
	EndDate         string    `gorm:"type:date" json:"end_date,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

func (OptimizationSuggestion) TableName() string {
	return "optimization_suggestions"
}

type SystemConfig struct {
	ID          int       `gorm:"primaryKey" json:"id"`
	ConfigKey   string    `gorm:"unique;size:100" json:"config_key"`
	ConfigValue string    `gorm:"type:text" json:"config_value"`
	Description string    `gorm:"size:500" json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (SystemConfig) TableName() string {
	return "system_configs"
}
