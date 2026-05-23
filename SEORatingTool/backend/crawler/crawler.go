package crawler

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
)

type PageData struct {
	URL           string
	HTML          string
	StatusCode    int
	Meta          MetaInfo
	Content       ContentInfo
	Links         []LinkInfo
	MobileFriendly MobileInfo
}

type MetaInfo struct {
	Title          string
	TitleLength    int
	Description    string
	DescriptionLen int
	Keywords       string
	Viewport       string
	Author         string
	Robots         string
	Favicon        string
	HasTitle       bool
	HasDescription bool
	HasKeywords    bool
	HasViewport    bool
	HasFavicon     bool
	Charset        string
}

type ContentInfo struct {
	TextContent string
	TotalWords  int
	H1Count     int
	H2Count     int
	H3Count     int
	ImgCount    int
	ImgWithAlt  int
	HasFavicon  bool
	HasSitemap  bool
	HasRobotsTxt bool
}

type LinkInfo struct {
	URL        string
	Type       string
	AnchorText string
	Nofollow   bool
	StatusCode int
}

type MobileInfo struct {
	HasViewport          bool
	HasFlexibleLayout    bool
	HasResponsiveImages  bool
	HasTouchTargets      bool
	FlashDetected        bool
	TextReadable         bool
}

var stopWords = map[string]bool{
	"the": true, "a": true, "an": true, "and": true, "or": true, "but": true,
	"in": true, "on": true, "at": true, "to": true, "for": true, "of": true,
	"with": true, "by": true, "from": true, "is": true, "are": true, "was": true,
	"were": true, "be": true, "been": true, "being": true, "have": true, "has": true,
	"had": true, "having": true, "do": true, "does": true, "did": true, "doing": true,
	"would": true, "could": true, "should": true, "may": true, "might": true, "shall": true,
	"can": true, "will": true, "just": true, "so": true, "than": true, "too": true,
	"very": true, "s": true, "t": true, "that": true, "this": true, "these": true,
	"those": true, "i": true, "you": true, "he": true, "she": true, "it": true,
	"we": true, "they": true, "what": true, "which": true, "who": true, "whom": true,
	"not": true, "no": true, "nor": true, "only": true,
	"own": true, "same": true, "also": true, "as": true, "up": true,
	"out": true, "about": true, "into": true, "over": true, "after": true, "before": true,
	"between": true, "through": true, "during": true, "without": true, "under": true,
	"then": true, "here": true, "there": true, "when": true, "where": true, "how": true,
	"all": true, "each": true, "every": true, "both": true, "few": true, "more": true,
	"most": true, "other": true, "some": true, "if": true, "because": true,
	"while": true, "although": true, "though": true, "unless": true, "until": true,
	"的": true, "了": true, "在": true, "是": true, "我": true, "有": true, "和": true,
	"就": true, "不": true, "人": true, "都": true, "一": true, "一个": true, "上": true,
	"也": true, "很": true, "到": true, "说": true, "要": true, "去": true, "你": true,
	"会": true, "着": true, "没有": true, "看": true, "好": true, "自己": true, "这": true,
	"那": true, "被": true, "从": true, "把": true, "让": true, "用": true, "对": true,
	"为": true, "以": true, "及": true, "其": true, "他": true, "她": true, "它": true,
	"们": true, "而": true, "与": true, "或": true, "如": true, "将": true,
}

func FetchPage(targetURL string) (*PageData, error) {
	client := &http.Client{
		Timeout: 30 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 10 {
				return fmt.Errorf("重定向次数过多")
			}
			return nil
		},
	}

	req, err := http.NewRequest("GET", targetURL, nil)
	if err != nil {
		return nil, fmt.Errorf("创建请求失败: %w", err)
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/***.***.***.*** Safari/537.36")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
	req.Header.Set("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8")

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("请求页面失败: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("读取页面内容失败: %w", err)
	}

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(string(body)))
	if err != nil {
		return nil, fmt.Errorf("解析HTML失败: %w", err)
	}

	pageData := &PageData{
		URL:        targetURL,
		HTML:       string(body),
		StatusCode: resp.StatusCode,
	}

	parseMeta(doc, pageData)
	parseContent(doc, pageData)
	parseLinks(doc, pageData, targetURL)
	checkMobileFriendly(doc, pageData)

	return pageData, nil
}

func parseMeta(doc *goquery.Document, pageData *PageData) {
	meta := MetaInfo{}

	title := doc.Find("title").Text()
	if title != "" {
		meta.Title = strings.TrimSpace(title)
		meta.TitleLength = len([]rune(meta.Title))
		meta.HasTitle = true
	}

	doc.Find("meta").Each(func(i int, s *goquery.Selection) {
		name, _ := s.Attr("name")
		property, _ := s.Attr("property")
		content, _ := s.Attr("content")
		httpEquiv, _ := s.Attr("http-equiv")

		switch strings.ToLower(name) {
		case "description":
			meta.Description = content
			meta.DescriptionLen = len([]rune(content))
			meta.HasDescription = true
		case "keywords":
			meta.Keywords = content
			meta.HasKeywords = true
		case "viewport":
			meta.Viewport = content
			meta.HasViewport = true
		case "author":
			meta.Author = content
		case "robots":
			meta.Robots = content
		}

		if strings.ToLower(property) == "og:title" && !meta.HasTitle {
			meta.Title = content
			meta.TitleLength = len([]rune(content))
			meta.HasTitle = true
		}

		if strings.ToLower(httpEquiv) == "content-type" {
			if strings.Contains(strings.ToLower(content), "charset=") {
				parts := strings.SplitN(content, "=", 2)
				if len(parts) == 2 {
					meta.Charset = strings.TrimSpace(parts[1])
				}
			}
		}
	})

	if meta.Charset == "" {
		charset, exists := doc.Find("meta[charset]").Attr("charset")
		if exists {
			meta.Charset = charset
		}
	}

	favicon := ""
	doc.Find("link[rel~=icon]").Each(func(i int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if exists {
			favicon = href
			return
		}
	})
	if favicon != "" {
		meta.Favicon = favicon
		meta.HasFavicon = true
	}

	pageData.Meta = meta
}

func parseContent(doc *goquery.Document, pageData *PageData) {
	content := ContentInfo{}

	content.H1Count = doc.Find("h1").Length()
	content.H2Count = doc.Find("h2").Length()
	content.H3Count = doc.Find("h3").Length()

	doc.Find("img").Each(func(i int, s *goquery.Selection) {
		content.ImgCount++
		alt, exists := s.Attr("alt")
		if exists && alt != "" {
			content.ImgWithAlt++
		}
	})

	textContent := doc.Find("body").Text()
	textContent = strings.TrimSpace(textContent)
	content.TextContent = textContent

	words := tokenize(textContent)
	content.TotalWords = len(words)

	content.HasFavicon = pageData.Meta.HasFavicon
	content.HasSitemap = checkSitemap(pageData.URL)
	content.HasRobotsTxt = checkRobotsTxt(pageData.URL)

	pageData.Content = content
}

func parseLinks(doc *goquery.Document, pageData *PageData, baseURL string) {
	parsedBase, _ := url.Parse(baseURL)
	var links []LinkInfo

	doc.Find("a").Each(func(i int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if !exists || href == "" {
			return
		}

		if strings.HasPrefix(href, "javascript:") || strings.HasPrefix(href, "#") || strings.HasPrefix(href, "mailto:") {
			return
		}

		linkType := "external"
		if strings.HasPrefix(href, "/") || strings.HasPrefix(href, ".") {
			linkType = "internal"
		} else if parsedURL, err := url.Parse(href); err == nil && parsedURL.Host == parsedBase.Host {
			linkType = "internal"
		}

		anchorText := strings.TrimSpace(s.Text())

		nofollow := false
		rel, _ := s.Attr("rel")
		if strings.Contains(strings.ToLower(rel), "nofollow") {
			nofollow = true
		}

		links = append(links, LinkInfo{
			URL:        href,
			Type:       linkType,
			AnchorText: truncate(anchorText, 100),
			Nofollow:   nofollow,
		})
	})

	pageData.Links = links
}

func checkMobileFriendly(doc *goquery.Document, pageData *PageData) {
	mobile := MobileInfo{}

	mobile.HasViewport = pageData.Meta.HasViewport

	cssLinks := doc.Find("link[rel=stylesheet]")
	cssLinks.Each(func(i int, s *goquery.Selection) {
		href, _ := s.Attr("href")
		if strings.Contains(href, "responsive") || strings.Contains(href, "mobile") {
			mobile.HasFlexibleLayout = true
		}
	})

	if strings.Contains(pageData.HTML, "@media") || strings.Contains(pageData.HTML, "flex") || strings.Contains(pageData.HTML, "grid") {
		mobile.HasFlexibleLayout = true
	}

	responsiveImg := true
	doc.Find("img").Each(func(i int, s *goquery.Selection) {
		width, hasWidth := s.Attr("width")
		height, hasHeight := s.Attr("height")
		_, hasSrcset := s.Attr("srcset")
		if !hasSrcset && (hasWidth && hasHeight) {
			if !strings.Contains(width, "%") && !strings.Contains(height, "%") {
				responsiveImg = false
			}
		}
	})
	mobile.HasResponsiveImages = responsiveImg

	mobile.HasTouchTargets = !strings.Contains(pageData.HTML, "onclick")

	mobile.FlashDetected = strings.Contains(strings.ToLower(pageData.HTML), ".swf") ||
		strings.Contains(strings.ToLower(pageData.HTML), "flash")

	textLen := len([]rune(pageData.Content.TextContent))
	mobile.TextReadable = textLen > 100

	pageData.MobileFriendly = mobile
}

func tokenize(text string) []string {
	text = strings.ToLower(text)
	var words []string
	for _, word := range strings.FieldsFunc(text, func(r rune) bool {
		return (r < 'a' || r > 'z') && (r < '0' || r > '9') && !isChineseChar(r)
	}) {
		word = strings.TrimSpace(word)
		if word != "" && !stopWords[word] && len([]rune(word)) >= 2 {
			words = append(words, word)
		}
	}
	return words
}

func isChineseChar(r rune) bool {
	return r >= 0x4e00 && r <= 0x9fff
}

func checkSitemap(baseURL string) bool {
	parsed, _ := url.Parse(baseURL)
	sitemapURL := fmt.Sprintf("%s://%s/sitemap.xml", parsed.Scheme, parsed.Host)
	
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(sitemapURL)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	return resp.StatusCode == 200
}

func checkRobotsTxt(baseURL string) bool {
	parsed, _ := url.Parse(baseURL)
	robotsURL := fmt.Sprintf("%s://%s/robots.txt", parsed.Scheme, parsed.Host)
	
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(robotsURL)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	return resp.StatusCode == 200
}

func truncate(s string, maxLen int) string {
	runes := []rune(s)
	if len(runes) > maxLen {
		return string(runes[:maxLen]) + "..."
	}
	return s
}
