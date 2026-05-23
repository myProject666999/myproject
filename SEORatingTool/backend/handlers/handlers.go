package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"

	"seoratingtool/crawler"
	"seoratingtool/database"
	"seoratingtool/models"
	"seoratingtool/scorer"
)

func AnalyzeURL(c *gin.Context) {
	var req models.AnalyzeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请提供有效的URL"})
		return
	}

	if !strings.HasPrefix(req.URL, "http://") && !strings.HasPrefix(req.URL, "https://") {
		req.URL = "https://" + req.URL
	}

	pageData, err := crawler.FetchPage(req.URL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "无法获取页面内容: " + err.Error()})
		return
	}

	s := scorer.NewScorer(pageData)
	result := s.Calculate()

	analysis := models.Analysis{
		URL:          req.URL,
		Title:        pageData.Meta.Title,
		Score:        result.TotalScore,
		MetaScore:    result.MetaScore,
		KeywordScore: result.KeywordScore,
		LinkScore:    result.LinkScore,
		MobileScore:  result.MobileScore,
		ContentScore: result.ContentScore,
	}

	suggestionsJSON, _ := json.Marshal(result.Suggestions)
	analysis.Suggestions = string(suggestionsJSON)

	analysisID, err := saveAnalysis(&analysis)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "保存分析结果失败"})
		return
	}

	metaDetail := models.MetaDetail{
		AnalysisID:     analysisID,
		Title:          pageData.Meta.Title,
		TitleLength:    pageData.Meta.TitleLength,
		Description:    pageData.Meta.Description,
		DescriptionLen: pageData.Meta.DescriptionLen,
		Keywords:       pageData.Meta.Keywords,
		Viewport:       pageData.Meta.Viewport,
		Author:         pageData.Meta.Author,
		Robots:         pageData.Meta.Robots,
		Favicon:        pageData.Meta.Favicon,
		HasTitle:       pageData.Meta.HasTitle,
		HasDescription: pageData.Meta.HasDescription,
		HasKeywords:    pageData.Meta.HasKeywords,
		HasViewport:    pageData.Meta.HasViewport,
		Charset:        pageData.Meta.Charset,
	}
	saveMetaDetail(&metaDetail)

	for _, kw := range result.Keywords {
		kw.AnalysisID = analysisID
		saveKeywordDetail(&kw)
	}

	for _, link := range pageData.Links {
		linkDetail := models.LinkDetail{
			AnalysisID: analysisID,
			URL:        link.URL,
			Type:       link.Type,
			AnchorText: link.AnchorText,
			Nofollow:   link.Nofollow,
		}
		saveLinkDetail(&linkDetail)
	}

	mobileDetail := models.MobileDetail{
		AnalysisID:          analysisID,
		HasViewport:         pageData.MobileFriendly.HasViewport,
		HasFlexibleLayout:   pageData.MobileFriendly.HasFlexibleLayout,
		HasResponsiveImages: pageData.MobileFriendly.HasResponsiveImages,
		HasTouchTargets:     pageData.MobileFriendly.HasTouchTargets,
		FlashDetected:       pageData.MobileFriendly.FlashDetected,
		TextReadable:        pageData.MobileFriendly.TextReadable,
	}
	saveMobileDetail(&mobileDetail)

	contentDetail := models.ContentDetail{
		AnalysisID:   analysisID,
		TotalWords:   pageData.Content.TotalWords,
		H1Count:      pageData.Content.H1Count,
		H2Count:      pageData.Content.H2Count,
		H3Count:      pageData.Content.H3Count,
		ImgCount:     pageData.Content.ImgCount,
		ImgWithAlt:   pageData.Content.ImgWithAlt,
		HasFavicon:   pageData.Content.HasFavicon,
		HasSitemap:   pageData.Content.HasSitemap,
		HasRobotsTxt: pageData.Content.HasRobotsTxt,
	}
	saveContentDetail(&contentDetail)

	analysis.ID = analysisID

	response := models.AnalyzeResponse{
		Analysis:      analysis,
		MetaDetail:    metaDetail,
		Keywords:      result.Keywords,
		Links:         convertLinks(pageData.Links),
		MobileDetail:  mobileDetail,
		ContentDetail: contentDetail,
	}

	c.JSON(http.StatusOK, response)
}

func GetReport(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的ID"})
		return
	}

	analysis, err := getAnalysisByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "报告不存在"})
		return
	}

	metaDetail, _ := getMetaDetail(id)
	keywords, _ := getKeywords(id)
	links, _ := getLinks(id)
	mobileDetail, _ := getMobileDetail(id)
	contentDetail, _ := getContentDetail(id)

	var suggestions []models.Suggestion
	if analysis.Suggestions != "" {
		json.Unmarshal([]byte(analysis.Suggestions), &suggestions)
	}

	response := models.ReportResponse{
		Analysis:      *analysis,
		MetaDetail:    *metaDetail,
		Keywords:      keywords,
		Links:         links,
		MobileDetail:  *mobileDetail,
		ContentDetail: *contentDetail,
		Suggestions:   suggestions,
	}

	c.JSON(http.StatusOK, response)
}

func GetHistory(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	rows, err := database.DB.Query(
		"SELECT id, url, title, score, meta_score, keyword_score, link_score, mobile_score, content_score, created_at FROM analysis ORDER BY created_at DESC LIMIT ? OFFSET ?",
		pageSize, offset,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询历史记录失败"})
		return
	}
	defer rows.Close()

	var analyses []models.Analysis
	for rows.Next() {
		var a models.Analysis
		rows.Scan(&a.ID, &a.URL, &a.Title, &a.Score, &a.MetaScore, &a.KeywordScore, &a.LinkScore, &a.MobileScore, &a.ContentScore, &a.CreatedAt)
		analyses = append(analyses, a)
	}

	var total int64
	database.DB.QueryRow("SELECT COUNT(*) FROM analysis").Scan(&total)

	c.JSON(http.StatusOK, gin.H{
		"data":     analyses,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

func DeleteAnalysis(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的ID"})
		return
	}

	_, err = database.DB.Exec("DELETE FROM analysis WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

func saveAnalysis(analysis *models.Analysis) (uint64, error) {
	result, err := database.DB.Exec(
		"INSERT INTO analysis (url, title, score, meta_score, keyword_score, link_score, mobile_score, content_score, suggestions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
		analysis.URL, analysis.Title, analysis.Score, analysis.MetaScore, analysis.KeywordScore,
		analysis.LinkScore, analysis.MobileScore, analysis.ContentScore, analysis.Suggestions,
	)
	if err != nil {
		return 0, err
	}

	id, _ := result.LastInsertId()
	return uint64(id), nil
}

func saveMetaDetail(meta *models.MetaDetail) {
	database.DB.Exec(
		"INSERT INTO meta_detail (analysis_id, title, title_length, description, description_length, keywords, viewport, author, robots, favicon, has_title, has_description, has_keywords, has_viewport, charset) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		meta.AnalysisID, meta.Title, meta.TitleLength, meta.Description, meta.DescriptionLen,
		meta.Keywords, meta.Viewport, meta.Author, meta.Robots, meta.Favicon,
		meta.HasTitle, meta.HasDescription, meta.HasKeywords, meta.HasViewport, meta.Charset,
	)
}

func saveKeywordDetail(kw *models.KeywordDetail) {
	database.DB.Exec(
		"INSERT INTO keyword_detail (analysis_id, keyword, count, density, in_title, in_description, in_h1, in_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
		kw.AnalysisID, kw.Keyword, kw.Count, kw.Density, kw.InTitle, kw.InDescription, kw.InH1, kw.InURL,
	)
}

func saveLinkDetail(link *models.LinkDetail) {
	database.DB.Exec(
		"INSERT INTO link_detail (analysis_id, url, type, anchor_text, nofollow, status_code) VALUES (?, ?, ?, ?, ?, ?)",
		link.AnalysisID, link.URL, link.Type, link.AnchorText, link.Nofollow, link.StatusCode,
	)
}

func saveMobileDetail(mobile *models.MobileDetail) {
	database.DB.Exec(
		"INSERT INTO mobile_detail (analysis_id, has_viewport, has_flexible_layout, has_responsive_images, has_touch_targets, flash_detected, text_readable) VALUES (?, ?, ?, ?, ?, ?, ?)",
		mobile.AnalysisID, mobile.HasViewport, mobile.HasFlexibleLayout, mobile.HasResponsiveImages,
		mobile.HasTouchTargets, mobile.FlashDetected, mobile.TextReadable,
	)
}

func saveContentDetail(content *models.ContentDetail) {
	database.DB.Exec(
		"INSERT INTO content_detail (analysis_id, total_words, h1_count, h2_count, h3_count, img_count, img_with_alt, has_favicon, has_sitemap, has_robots_txt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		content.AnalysisID, content.TotalWords, content.H1Count, content.H2Count, content.H3Count,
		content.ImgCount, content.ImgWithAlt, content.HasFavicon, content.HasSitemap, content.HasRobotsTxt,
	)
}

func getAnalysisByID(id uint64) (*models.Analysis, error) {
	var a models.Analysis
	err := database.DB.QueryRow(
		"SELECT id, url, title, score, meta_score, keyword_score, link_score, mobile_score, content_score, suggestions, created_at, updated_at FROM analysis WHERE id = ?",
		id,
	).Scan(&a.ID, &a.URL, &a.Title, &a.Score, &a.MetaScore, &a.KeywordScore, &a.LinkScore, &a.MobileScore, &a.ContentScore, &a.Suggestions, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func getMetaDetail(analysisID uint64) (*models.MetaDetail, error) {
	var m models.MetaDetail
	err := database.DB.QueryRow(
		"SELECT id, analysis_id, title, title_length, description, description_length, keywords, viewport, author, robots, favicon, has_title, has_description, has_keywords, has_viewport, charset FROM meta_detail WHERE analysis_id = ?",
		analysisID,
	).Scan(&m.ID, &m.AnalysisID, &m.Title, &m.TitleLength, &m.Description, &m.DescriptionLen, &m.Keywords, &m.Viewport, &m.Author, &m.Robots, &m.Favicon, &m.HasTitle, &m.HasDescription, &m.HasKeywords, &m.HasViewport, &m.Charset)
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func getKeywords(analysisID uint64) ([]models.KeywordDetail, error) {
	rows, err := database.DB.Query(
		"SELECT id, analysis_id, keyword, count, density, in_title, in_description, in_h1, in_url FROM keyword_detail WHERE analysis_id = ? ORDER BY count DESC",
		analysisID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var keywords []models.KeywordDetail
	for rows.Next() {
		var k models.KeywordDetail
		rows.Scan(&k.ID, &k.AnalysisID, &k.Keyword, &k.Count, &k.Density, &k.InTitle, &k.InDescription, &k.InH1, &k.InURL)
		keywords = append(keywords, k)
	}
	return keywords, nil
}

func getLinks(analysisID uint64) ([]models.LinkDetail, error) {
	rows, err := database.DB.Query(
		"SELECT id, analysis_id, url, type, anchor_text, nofollow, status_code FROM link_detail WHERE analysis_id = ?",
		analysisID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var links []models.LinkDetail
	for rows.Next() {
		var l models.LinkDetail
		rows.Scan(&l.ID, &l.AnalysisID, &l.URL, &l.Type, &l.AnchorText, &l.Nofollow, &l.StatusCode)
		links = append(links, l)
	}
	return links, nil
}

func getMobileDetail(analysisID uint64) (*models.MobileDetail, error) {
	var m models.MobileDetail
	err := database.DB.QueryRow(
		"SELECT id, analysis_id, has_viewport, has_flexible_layout, has_responsive_images, has_touch_targets, flash_detected, text_readable FROM mobile_detail WHERE analysis_id = ?",
		analysisID,
	).Scan(&m.ID, &m.AnalysisID, &m.HasViewport, &m.HasFlexibleLayout, &m.HasResponsiveImages, &m.HasTouchTargets, &m.FlashDetected, &m.TextReadable)
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func getContentDetail(analysisID uint64) (*models.ContentDetail, error) {
	var c models.ContentDetail
	err := database.DB.QueryRow(
		"SELECT id, analysis_id, total_words, h1_count, h2_count, h3_count, img_count, img_with_alt, has_favicon, has_sitemap, has_robots_txt FROM content_detail WHERE analysis_id = ?",
		analysisID,
	).Scan(&c.ID, &c.AnalysisID, &c.TotalWords, &c.H1Count, &c.H2Count, &c.H3Count, &c.ImgCount, &c.ImgWithAlt, &c.HasFavicon, &c.HasSitemap, &c.HasRobotsTxt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func convertLinks(links []crawler.LinkInfo) []models.LinkDetail {
	var result []models.LinkDetail
	for _, l := range links {
		result = append(result, models.LinkDetail{
			URL:        l.URL,
			Type:       l.Type,
			AnchorText: l.AnchorText,
			Nofollow:   l.Nofollow,
			StatusCode: l.StatusCode,
		})
	}
	return result
}
