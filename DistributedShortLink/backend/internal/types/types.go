package types

import "shortlink/internal/model"

type Resp struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg,omitempty"`
	Data interface{} `json:"data,omitempty"`
}

type CreateShortReq struct {
	URL        string `json:"url"`
	CustomCode string `json:"customCode"`
	ExpireAt   string `json:"expireAt"`
}

type ShortResp struct {
	ShortLink string `json:"shortLink"`
	Code      string `json:"code"`
	URL       string `json:"url"`
}

type ListResp struct {
	List  []model.ShortLink `json:"list"`
	Total int64             `json:"total"`
}

type SetStatusReq struct {
	ID     uint64 `json:"id"`
	Status int8   `json:"status"`
}

type DailyPoint struct {
	Day string `json:"day"`
	Cnt int64  `json:"cnt"`
}

type StatsResp struct {
	Code  string       `json:"code"`
	Total int64        `json:"total"`
	Daily []DailyPoint `json:"daily"`
}

type LoginReq struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Email    string `json:"email,omitempty"`
}

type LoginResp struct {
	UserID   uint64 `json:"userId"`
	Username string `json:"username"`
	Token    string `json:"token,omitempty"`
}
