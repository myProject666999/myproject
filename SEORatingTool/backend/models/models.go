package models

import "time"

type Analysis struct {
	ID           uint64    `json:"id"`
	URL          string    `json:"url"`
	Title        string    `json:"title"`
	Score        int       `json:"score"`
	MetaScore    int       `json:"meta_score"`
	KeywordScore int       `json:"keyword_score"`
	LinkScore    int       `json:"link_score"`
	MobileScore  int       `json:"mobile_score"`
	ContentScore int       `json:"content_score"`
	Suggestions  string    `json:"suggestions"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type MetaDetail struct {
	ID             uint64    `json:"id"`
	AnalysisID     uint64    `json:"analysis_id"`
	Title          string    `json:"title"`
	TitleLength    int       `json:"title_length"`
	Description    string    `json:"description"`
	DescriptionLen int       `json:"description_length"`
	Keywords       string    `json:"keywords"`
	Viewport       string    `json:"viewport"`
	Author         string    `json:"author"`
	Robots         string    `json:"robots"`
	Favicon        string    `json:"favicon"`
	HasTitle       bool      `json:"has_title"`
	HasDescription bool      `json:"has_description"`
	HasKeywords    bool      `json:"has_keywords"`
	HasViewport    bool      `json:"has_viewport"`
	Charset        string    `json:"charset"`
	CreatedAt      time.Time `json:"created_at"`
}

type KeywordDetail struct {
	ID            uint64    `json:"id"`
	AnalysisID    uint64    `json:"analysis_id"`
	Keyword       string    `json:"keyword"`
	Count         int       `json:"count"`
	Density       float64   `json:"density"`
	InTitle       bool      `json:"in_title"`
	InDescription bool      `json:"in_description"`
	InH1          bool      `json:"in_h1"`
	InURL         bool      `json:"in_url"`
	CreatedAt     time.Time `json:"created_at"`
}

type LinkDetail struct {
	ID          uint64    `json:"id"`
	AnalysisID  uint64    `json:"analysis_id"`
	URL         string    `json:"url"`
	Type        string    `json:"type"`
	AnchorText  string    `json:"anchor_text"`
	Nofollow    bool      `json:"nofollow"`
	StatusCode  int       `json:"status_code"`
	CreatedAt   time.Time `json:"created_at"`
}

type MobileDetail struct {
	ID                   uint64    `json:"id"`
	AnalysisID           uint64    `json:"analysis_id"`
	HasViewport          bool      `json:"has_viewport"`
	HasFlexibleLayout    bool      `json:"has_flexible_layout"`
	HasResponsiveImages  bool      `json:"has_responsive_images"`
	HasTouchTargets      bool      `json:"has_touch_targets"`
	FlashDetected        bool      `json:"flash_detected"`
	TextReadable         bool      `json:"text_readable"`
	CreatedAt            time.Time `json:"created_at"`
}

type ContentDetail struct {
	ID             uint64    `json:"id"`
	AnalysisID     uint64    `json:"analysis_id"`
	TotalWords     int       `json:"total_words"`
	H1Count        int       `json:"h1_count"`
	H2Count        int       `json:"h2_count"`
	H3Count        int       `json:"h3_count"`
	ImgCount       int       `json:"img_count"`
	ImgWithAlt     int       `json:"img_with_alt"`
	HasFavicon     bool      `json:"has_favicon"`
	HasSitemap     bool      `json:"has_sitemap"`
	HasRobotsTxt   bool      `json:"has_robots_txt"`
	CreatedAt      time.Time `json:"created_at"`
}

type AnalyzeRequest struct {
	URL string `json:"url" binding:"required,url"`
}

type AnalyzeResponse struct {
	Analysis      Analysis       `json:"analysis"`
	MetaDetail    MetaDetail     `json:"meta_detail"`
	Keywords      []KeywordDetail `json:"keywords"`
	Links         []LinkDetail   `json:"links"`
	MobileDetail  MobileDetail   `json:"mobile_detail"`
	ContentDetail ContentDetail  `json:"content_detail"`
}

type ReportResponse struct {
	Analysis      Analysis       `json:"analysis"`
	MetaDetail    MetaDetail     `json:"meta_detail"`
	Keywords      []KeywordDetail `json:"keywords"`
	Links         []LinkDetail   `json:"links"`
	MobileDetail  MobileDetail   `json:"mobile_detail"`
	ContentDetail ContentDetail  `json:"content_detail"`
	Suggestions   []Suggestion   `json:"suggestions"`
}

type Suggestion struct {
	Category string `json:"category"`
	Title    string `json:"title"`
	Content  string `json:"content"`
	Level    string `json:"level"`
}
