package types

import "time"

type UserInfo struct {
	Id         int64  `json:"id"`
	Username   string `json:"username"`
	RealName   string `json:"realName"`
	Email      string `json:"email"`
	Phone      string `json:"phone"`
	Avatar     string `json:"avatar"`
	Role       int    `json:"role"`
	Department string `json:"department"`
	SkillTags  string `json:"skillTags"`
	OnlineStatus int `json:"onlineStatus"`
	Status     int    `json:"status"`
	CreatedAt  time.Time `json:"createdAt"`
}

type LoginReq struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResp struct {
	AccessToken string   `json:"accessToken"`
	ExpireAt    int64    `json:"expireAt"`
	UserInfo    UserInfo `json:"userInfo"`
}

type CreateUserReq struct {
	Username   string `json:"username"`
	Password   string `json:"password"`
	RealName   string `json:"realName"`
	Email      string `json:"email"`
	Phone      string `json:"phone"`
	Role       int    `json:"role"`
	Department string `json:"department"`
	SkillTags  string `json:"skillTags"`
}

type UpdateUserReq struct {
	Id         int64  `json:"id"`
	RealName   string `json:"realName"`
	Email      string `json:"email"`
	Phone      string `json:"phone"`
	Avatar     string `json:"avatar"`
	Department string `json:"department"`
	SkillTags  string `json:"skillTags"`
	Status     int    `json:"status"`
}

type UserListReq struct {
	Page     int `json:"page"`
	PageSize int `json:"pageSize"`
	Role     int `json:"role"`
	Status   int `json:"status"`
	Keyword  string `json:"keyword"`
}

type UserListResp struct {
	Total int64      `json:"total"`
	List  []UserInfo `json:"list"`
}

type TicketCategoryInfo struct {
	Id          int64  `json:"id"`
	Name        string `json:"name"`
	ParentId    int64  `json:"parentId"`
	Description string `json:"description"`
	Sort        int    `json:"sort"`
	Icon        string `json:"icon"`
	Children    []TicketCategoryInfo `json:"children,omitempty"`
}

type TicketPriorityInfo struct {
	Id              int64  `json:"id"`
	Name            string `json:"name"`
	Level           int    `json:"level"`
	Color           string `json:"color"`
	ResponseTimeout int    `json:"responseTimeout"`
	ResolveTimeout  int    `json:"resolveTimeout"`
}

type TicketStatusInfo struct {
	Id        int64  `json:"id"`
	Code      string `json:"code"`
	Name      string `json:"name"`
	Color     string `json:"color"`
	IsInitial int    `json:"isInitial"`
	IsFinal   int    `json:"isFinal"`
}

type TicketInfo struct {
	Id              int64          `json:"id"`
	TicketNo        string         `json:"ticketNo"`
	Title           string         `json:"title"`
	Content         string         `json:"content"`
	CategoryId      int64          `json:"categoryId"`
	CategoryName    string         `json:"categoryName"`
	PriorityId      int64          `json:"priorityId"`
	PriorityName    string         `json:"priorityName"`
	PriorityColor   string         `json:"priorityColor"`
	StatusCode      string         `json:"statusCode"`
	StatusName      string         `json:"statusName"`
	StatusColor     string         `json:"statusColor"`
	CustomerId      int64          `json:"customerId"`
	CustomerName    string         `json:"customerName"`
	AssigneeId      *int64         `json:"assigneeId"`
	AssigneeName    string         `json:"assigneeName"`
	Source          string         `json:"source"`
	Channel         string         `json:"channel"`
	Tags            string         `json:"tags"`
	MessageCount    int            `json:"messageCount"`
	LastMessageAt   *time.Time     `json:"lastMessageAt"`
	FirstResponseAt *time.Time     `json:"firstResponseAt"`
	AssignedAt      *time.Time     `json:"assignedAt"`
	ResolvedAt      *time.Time     `json:"resolvedAt"`
	ClosedAt        *time.Time     `json:"closedAt"`
	IsTimeoutWarned int            `json:"isTimeoutWarned"`
	CreatedAt       time.Time      `json:"createdAt"`
	UpdatedAt       time.Time      `json:"updatedAt"`
}

type CreateTicketReq struct {
	Title       string `json:"title"`
	Content     string `json:"content"`
	CategoryId  int64  `json:"categoryId"`
	PriorityId  int64  `json:"priorityId"`
	Source      string `json:"source"`
	Channel     string `json:"channel"`
	Tags        string `json:"tags"`
}

type UpdateTicketReq struct {
	Id          int64  `json:"id"`
	Title       string `json:"title"`
	Content     string `json:"content"`
	CategoryId  int64  `json:"categoryId"`
	PriorityId  int64  `json:"priorityId"`
	Tags        string `json:"tags"`
}

type AssignTicketReq struct {
	TicketId   int64 `json:"ticketId"`
	AssigneeId int64 `json:"assigneeId"`
}

type TicketListReq struct {
	Page       int    `json:"page"`
	PageSize   int    `json:"pageSize"`
	StatusCode string `json:"statusCode"`
	CategoryId int64  `json:"categoryId"`
	PriorityId int64  `json:"priorityId"`
	AssigneeId int64  `json:"assigneeId"`
	CustomerId int64  `json:"customerId"`
	Keyword    string `json:"keyword"`
	StartTime  string `json:"startTime"`
	EndTime    string `json:"endTime"`
}

type TicketListResp struct {
	Total int64        `json:"total"`
	List  []TicketInfo `json:"list"`
}

type TicketMessageInfo struct {
	Id         int64      `json:"id"`
	TicketId   int64      `json:"ticketId"`
	SenderId   int64      `json:"senderId"`
	SenderRole int        `json:"senderRole"`
	SenderName string     `json:"senderName"`
	MessageType int       `json:"messageType"`
	Content    string     `json:"content"`
	IsRead     int        `json:"isRead"`
	IsRobot    int        `json:"isRobot"`
	CreatedAt  time.Time  `json:"createdAt"`
}

type SendMessageReq struct {
	TicketId    int64  `json:"ticketId"`
	Content     string `json:"content"`
	MessageType int    `json:"messageType"`
}

type OperationLogInfo struct {
	Id            int64      `json:"id"`
	TicketId      int64      `json:"ticketId"`
	OperationType string     `json:"operationType"`
	FromStatus    string     `json:"fromStatus"`
	ToStatus      string     `json:"toStatus"`
	OperatorId    int64      `json:"operatorId"`
	OperatorRole  int        `json:"operatorRole"`
	OperatorName  string     `json:"operatorName"`
	Content       string     `json:"content"`
	CreatedAt     time.Time  `json:"createdAt"`
}

type KbCategoryInfo struct {
	Id       int64            `json:"id"`
	Name     string           `json:"name"`
	ParentId int64            `json:"parentId"`
	Sort     int              `json:"sort"`
	Icon     string           `json:"icon"`
	Children []KbCategoryInfo `json:"children,omitempty"`
}

type KbArticleInfo struct {
	Id               int64      `json:"id"`
	CategoryId       int64      `json:"categoryId"`
	CategoryName     string     `json:"categoryName"`
	Title            string     `json:"title"`
	Summary          string     `json:"summary"`
	Keywords         string     `json:"keywords"`
	ViewCount        int        `json:"viewCount"`
	HelpfulCount     int        `json:"helpfulCount"`
	NotHelpfulCount  int        `json:"notHelpfulCount"`
	Status           int        `json:"status"`
	PublishedAt      *time.Time `json:"publishedAt"`
	CreatedAt        time.Time  `json:"createdAt"`
}

type KbArticleDetail struct {
	KbArticleInfo
	Content string `json:"content"`
}

type CreateKbArticleReq struct {
	CategoryId int64  `json:"categoryId"`
	Title      string `json:"title"`
	Content    string `json:"content"`
	Summary    string `json:"summary"`
	Keywords   string `json:"keywords"`
	Status     int    `json:"status"`
}

type UpdateKbArticleReq struct {
	Id         int64  `json:"id"`
	CategoryId int64  `json:"categoryId"`
	Title      string `json:"title"`
	Content    string `json:"content"`
	Summary    string `json:"summary"`
	Keywords   string `json:"keywords"`
	Status     int    `json:"status"`
}

type KbArticleListReq struct {
	Page       int    `json:"page"`
	PageSize   int    `json:"pageSize"`
	CategoryId int64  `json:"categoryId"`
	Keyword    string `json:"keyword"`
	Status     int    `json:"status"`
}

type KbArticleListResp struct {
	Total int64            `json:"total"`
	List  []KbArticleInfo  `json:"list"`
}

type StatsOverview struct {
	TotalTickets     int64   `json:"totalTickets"`
	PendingTickets   int64   `json:"pendingTickets"`
	ProcessingTickets int64 `json:"processingTickets"`
	ResolvedTickets  int64   `json:"resolvedTickets"`
	ClosedTickets    int64   `json:"closedTickets"`
	TodayNewTickets  int64   `json:"todayNewTickets"`
	TodayResolved    int64   `json:"todayResolved"`
	AvgResponseTime  float64 `json:"avgResponseTime"`
	AvgResolveTime   float64 `json:"avgResolveTime"`
	ResolutionRate   float64 `json:"resolutionRate"`
}

type AgentWorkloadInfo struct {
	AgentId         int64   `json:"agentId"`
	AgentName       string  `json:"agentName"`
	OnlineDuration  int     `json:"onlineDuration"`
	TicketCount     int     `json:"ticketCount"`
	ResolvedCount   int     `json:"resolvedCount"`
	AvgResponseTime float64 `json:"avgResponseTime"`
	AvgResolveTime  float64 `json:"avgResolveTime"`
	SatisfactionAvg float64 `json:"satisfactionAvg"`
}

type TicketTrendItem struct {
	Date  string `json:"date"`
	Count int64  `json:"count"`
}

type CategoryStatsItem struct {
	CategoryId   int64  `json:"categoryId"`
	CategoryName string `json:"categoryName"`
	Count        int64  `json:"count"`
}

type StatsReq struct {
	StartTime string `json:"startTime"`
	EndTime   string `json:"endTime"`
}
