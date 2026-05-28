package model

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

type PageResult struct {
	List     interface{} `json:"list"`
	Total    int64       `json:"total"`
	Page     int         `json:"page"`
	PageSize int         `json:"page_size"`
}

type UserInfoVO struct {
	ID           uint   `gorm:"-" json:"id"`
	Username     string `gorm:"-" json:"username"`
	Nickname     string `gorm:"-" json:"nickname"`
	AvatarURL    string `gorm:"-" json:"avatar_url"`
	OnlineStatus int8   `gorm:"-" json:"online_status"`
	BusyMode     int8   `gorm:"-" json:"busy_mode"`
	TextStatus   string `gorm:"-" json:"text_status"`
	CurrentRoomID *uint `gorm:"-" json:"current_room_id"`
}

type RoomVO struct {
	ID           uint         `gorm:"-" json:"id"`
	Name         string       `gorm:"-" json:"name"`
	Description  string       `gorm:"-" json:"description"`
	Type         int8         `gorm:"-" json:"type"`
	MaxCapacity  int          `gorm:"-" json:"max_capacity"`
	OwnerID      uint         `gorm:"-" json:"owner_id"`
	IsPublic     int8         `gorm:"-" json:"is_public"`
	MemberCount  int          `gorm:"-" json:"member_count"`
	Members      []UserInfoVO `gorm:"-" json:"members"`
}

type SeatVO struct {
	ID          uint   `gorm:"-" json:"id"`
	SeatNumber  string `gorm:"-" json:"seat_number"`
	PosX        int    `gorm:"-" json:"pos_x"`
	PosY        int    `gorm:"-" json:"pos_y"`
	UserID      *uint  `gorm:"-" json:"user_id"`
	IsOccupied  int8   `gorm:"-" json:"is_occupied"`
	Nickname    string `gorm:"-" json:"nickname"`
	AvatarURL   string `gorm:"-" json:"avatar_url"`
}
