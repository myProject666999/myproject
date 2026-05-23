package scorer

import (
	"fmt"
	"sort"
	"strings"

	"seoratingtool/crawler"
	"seoratingtool/models"
)

type Scorer struct {
	pageData *crawler.PageData
}

func NewScorer(pageData *crawler.PageData) *Scorer {
	return &Scorer{pageData: pageData}
}

type ScoreResult struct {
	TotalScore   int
	MetaScore    int
	KeywordScore int
	LinkScore    int
	MobileScore  int
	ContentScore int
	Keywords     []models.KeywordDetail
	Suggestions  []models.Suggestion
}

func (s *Scorer) Calculate() *ScoreResult {
	result := &ScoreResult{}

	metaScore, metaSuggestions := s.scoreMeta()
	result.MetaScore = metaScore
	result.Suggestions = append(result.Suggestions, metaSuggestions...)

	keywordScore, keywords, keywordSuggestions := s.scoreKeywords()
	result.KeywordScore = keywordScore
	result.Keywords = keywords
	result.Suggestions = append(result.Suggestions, keywordSuggestions...)

	linkScore, linkSuggestions := s.scoreLinks()
	result.LinkScore = linkScore
	result.Suggestions = append(result.Suggestions, linkSuggestions...)

	mobileScore, mobileSuggestions := s.scoreMobile()
	result.MobileScore = mobileScore
	result.Suggestions = append(result.Suggestions, mobileSuggestions...)

	contentScore, contentSuggestions := s.scoreContent()
	result.ContentScore = contentScore
	result.Suggestions = append(result.Suggestions, contentSuggestions...)

	result.TotalScore = result.MetaScore + result.KeywordScore + result.LinkScore + result.MobileScore + result.ContentScore

	return result
}

func (s *Scorer) scoreMeta() (int, []models.Suggestion) {
	score := 0
	var suggestions []models.Suggestion
	meta := s.pageData.Meta

	if meta.HasTitle {
		score += 3
		if meta.TitleLength >= 30 && meta.TitleLength <= 60 {
			score += 2
		} else if meta.TitleLength > 0 {
			suggestions = append(suggestions, models.Suggestion{
				Category: "Meta标签",
				Title:    "Title长度优化",
				Content:  fmt.Sprintf("当前Title长度为%d字符，建议保持在30-60字符之间以获得最佳搜索结果展示效果。", meta.TitleLength),
				Level:    "warning",
			})
		}
	} else {
		suggestions = append(suggestions, models.Suggestion{
			Category: "Meta标签",
			Title:    "添加Title标签",
			Content:  "页面缺少Title标签，Title是SEO最重要的元素之一，请添加一个包含核心关键词的Title标签。",
			Level:    "error",
		})
	}

	if meta.HasDescription {
		score += 3
		if meta.DescriptionLen >= 70 && meta.DescriptionLen <= 160 {
			score += 2
		} else {
			suggestions = append(suggestions, models.Suggestion{
				Category: "Meta标签",
				Title:    "Description长度优化",
				Content:  fmt.Sprintf("当前Description长度为%d字符，建议保持在70-160字符之间。", meta.DescriptionLen),
				Level:    "warning",
			})
		}
	} else {
		suggestions = append(suggestions, models.Suggestion{
			Category: "Meta标签",
			Title:    "添加Description标签",
			Content:  "页面缺少Meta Description，这会影响搜索结果中的摘要展示，请添加一个吸引人的描述。",
			Level:    "error",
		})
	}

	if meta.HasKeywords {
		score += 3
	} else {
		suggestions = append(suggestions, models.Suggestion{
			Category: "Meta标签",
			Title:    "添加Keywords标签",
			Content:  "虽然Keywords标签对现代搜索引擎影响较小，但仍建议添加以覆盖一些较旧的搜索引擎。",
			Level:    "info",
		})
	}

	if meta.HasViewport {
		score += 3
	} else {
		suggestions = append(suggestions, models.Suggestion{
			Category: "Meta标签",
			Title:    "添加Viewport标签",
			Content:  "缺少Viewport标签会影响移动端用户体验和移动搜索排名，请添加<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">。",
			Level:    "error",
		})
	}

	if meta.Author != "" {
		score++
	}
	if meta.Robots != "" {
		score++
	}
	if meta.Charset != "" {
		score++
	}

	return score, suggestions
}

func (s *Scorer) scoreKeywords() (int, []models.KeywordDetail, []models.Suggestion) {
	score := 0
	var suggestions []models.Suggestion
	var keywordDetails []models.KeywordDetail

	text := s.pageData.Content.TextContent
	words := extractKeywords(text)

	type keywordCount struct {
		word  string
		count int
	}
	var counts []keywordCount
	for word, count := range words {
		counts = append(counts, keywordCount{word, count})
	}
	sort.Slice(counts, func(i, j int) bool {
		return counts[i].count > counts[j].count
	})

	totalWords := s.pageData.Content.TotalWords
	if totalWords == 0 {
		totalWords = 1
	}

	topN := 10
	if len(counts) < topN {
		topN = len(counts)
	}

	titleLower := strings.ToLower(s.pageData.Meta.Title)
	descLower := strings.ToLower(s.pageData.Meta.Description)
	h1Text := ""
	for i := 0; i < s.pageData.Content.H1Count; i++ {
		h1Text += " "
	}
	h1Lower := strings.ToLower(h1Text)
	urlLower := strings.ToLower(s.pageData.URL)

	for i := 0; i < topN; i++ {
		kc := counts[i]
		density := float64(kc.count) / float64(totalWords) * 100
		keywordDetail := models.KeywordDetail{
			Keyword:       kc.word,
			Count:         kc.count,
			Density:       density,
			InTitle:       strings.Contains(titleLower, kc.word),
			InDescription: strings.Contains(descLower, kc.word),
			InH1:          strings.Contains(h1Lower, kc.word),
			InURL:         strings.Contains(urlLower, kc.word),
		}
		keywordDetails = append(keywordDetails, keywordDetail)
	}

	if len(keywordDetails) > 0 {
		mainKeyword := keywordDetails[0]
		density := mainKeyword.Density

		if density >= 1.0 && density <= 3.0 {
			score += 10
		} else if density > 0 && density < 1.0 {
			score += 5
			suggestions = append(suggestions, models.Suggestion{
				Category: "关键词",
				Title:    "提高关键词密度",
				Content:  fmt.Sprintf("主要关键词\"%s\"的密度为%.2f%%，建议提高到1%-3%的范围以获得更好的排名。", mainKeyword.Keyword, density),
				Level:    "warning",
			})
		} else if density > 3.0 {
			score += 3
			suggestions = append(suggestions, models.Suggestion{
				Category: "关键词",
				Title:    "降低关键词密度",
				Content:  fmt.Sprintf("主要关键词\"%s\"的密度为%.2f%%，过高可能被视为关键词堆砌，建议降低到1%-3%。", mainKeyword.Keyword, density),
				Level:    "error",
			})
		}

		if mainKeyword.InTitle {
			score += 5
		} else {
			suggestions = append(suggestions, models.Suggestion{
				Category: "关键词",
				Title:    "在Title中包含关键词",
				Content:  fmt.Sprintf("主要关键词\"%s\"未出现在Title中，建议将其添加到Title标签的前部。", mainKeyword.Keyword),
				Level:    "error",
			})
		}

		if mainKeyword.InH1 {
			score += 3
		} else if s.pageData.Content.H1Count > 0 {
			suggestions = append(suggestions, models.Suggestion{
				Category: "关键词",
				Title:    "在H1标签中包含关键词",
				Content:  fmt.Sprintf("主要关键词\"%s\"未出现在H1标签中，建议在H1中自然地包含该关键词。", mainKeyword.Keyword),
				Level:    "warning",
			})
		}

		if mainKeyword.InDescription {
			score += 2
		}
	} else {
		suggestions = append(suggestions, models.Suggestion{
			Category: "关键词",
			Title:    "内容不足",
			Content:  "页面内容较少，无法提取有效关键词。建议增加高质量的原创内容。",
			Level:    "error",
		})
	}

	return score, keywordDetails, suggestions
}

func (s *Scorer) scoreLinks() (int, []models.Suggestion) {
	score := 0
	var suggestions []models.Suggestion

	internalLinks := 0
	externalLinks := 0
	nofollowLinks := 0
	anchorTexts := make(map[string]bool)

	for _, link := range s.pageData.Links {
		if link.Type == "internal" {
			internalLinks++
		} else {
			externalLinks++
		}
		if link.Nofollow {
			nofollowLinks++
		}
		if link.AnchorText != "" && !strings.HasPrefix(link.AnchorText, "http") {
			anchorTexts[link.AnchorText] = true
		}
	}

	if internalLinks > 0 {
		if internalLinks >= 3 && internalLinks <= 20 {
			score += 8
		} else if internalLinks > 20 {
			score += 6
			suggestions = append(suggestions, models.Suggestion{
				Category: "链接",
				Title:    "减少内链数量",
				Content:  fmt.Sprintf("当前内链数量为%d，过多的内链可能分散页面权重，建议保持在3-20个之间。", internalLinks),
				Level:    "warning",
			})
		} else {
			score += 4
			suggestions = append(suggestions, models.Suggestion{
				Category: "链接",
				Title:    "增加内链数量",
				Content:  fmt.Sprintf("当前内链数量为%d，建议增加更多的内部链接以帮助搜索引擎索引和用户导航。", internalLinks),
				Level:    "info",
			})
		}
	} else {
		suggestions = append(suggestions, models.Suggestion{
			Category: "链接",
			Title:    "添加内链",
			Content:  "页面没有内部链接，建议添加指向网站其他相关页面的链接，以改善网站结构和用户体验。",
			Level:    "error",
		})
	}

	if externalLinks > 0 {
		if externalLinks <= 10 {
			score += 6
		} else {
			score += 3
			suggestions = append(suggestions, models.Suggestion{
				Category: "链接",
				Title:    "减少外链数量",
				Content:  fmt.Sprintf("当前外链数量为%d，过多的外链可能分散页面权重，建议保持在10个以下。", externalLinks),
				Level:    "warning",
			})
		}

		if nofollowLinks > 0 {
			score += 2
		} else if externalLinks > 5 {
			suggestions = append(suggestions, models.Suggestion{
				Category: "链接",
				Title:    "为外链添加nofollow",
				Content:  "建议为不受信任的外部链接添加rel=\"nofollow\"属性，以避免传递页面权重。",
				Level:    "info",
			})
		}
	} else {
		suggestions = append(suggestions, models.Suggestion{
			Category: "链接",
			Title:    "添加相关外链",
			Content:  "适当的外部链接可以增加页面的权威性，建议添加1-5个指向权威网站的相关链接。",
			Level:    "info",
		})
	}

	if len(anchorTexts) >= 3 {
		score += 6
	} else if len(anchorTexts) > 0 {
		score += 3
		suggestions = append(suggestions, models.Suggestion{
			Category: "链接",
			Title:    "优化锚文本",
			Content:  "锚文本种类较少，建议使用更丰富的描述性锚文本，而不是通用词如\"点击这里\"。",
			Level:    "warning",
		})
	}

	return score, suggestions
}

func (s *Scorer) scoreMobile() (int, []models.Suggestion) {
	score := 0
	var suggestions []models.Suggestion
	mobile := s.pageData.MobileFriendly

	if mobile.HasViewport {
		score += 5
	} else {
		suggestions = append(suggestions, models.Suggestion{
			Category: "移动友好",
			Title:    "添加Viewport元标签",
			Content:  "缺少Viewport标签会导致移动端显示不正确，请添加<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">。",
			Level:    "error",
		})
	}

	if mobile.HasFlexibleLayout {
		score += 5
	} else {
		suggestions = append(suggestions, models.Suggestion{
			Category: "移动友好",
			Title:    "使用响应式布局",
			Content:  "页面可能没有使用响应式设计，建议使用CSS媒体查询或响应式框架来适配不同屏幕尺寸。",
			Level:    "warning",
		})
	}

	if mobile.HasResponsiveImages {
		score += 4
	} else {
		suggestions = append(suggestions, models.Suggestion{
			Category: "移动友好",
			Title:    "优化图片响应式",
			Content:  "图片可能没有设置响应式属性，建议使用srcset属性或CSS max-width: 100%来确保图片在移动设备上正确显示。",
			Level:    "warning",
		})
	}

	if !mobile.FlashDetected {
		score += 3
	} else {
		suggestions = append(suggestions, models.Suggestion{
			Category: "移动友好",
			Title:    "移除Flash内容",
			Content:  "移动设备不支持Flash，建议使用HTML5或其他现代技术替代Flash内容。",
			Level:    "error",
		})
	}

	if mobile.HasTouchTargets {
		score += 3
	} else {
		suggestions = append(suggestions, models.Suggestion{
			Category: "移动友好",
			Title:    "优化触摸目标",
			Content:  "页面可能使用了不适合触摸的元素，建议确保按钮和链接至少有44x44像素的触摸区域。",
			Level:    "warning",
		})
	}

	return score, suggestions
}

func (s *Scorer) scoreContent() (int, []models.Suggestion) {
	score := 0
	var suggestions []models.Suggestion
	content := s.pageData.Content

	if content.TotalWords >= 300 {
		score += 5
	} else if content.TotalWords >= 100 {
		score += 3
		suggestions = append(suggestions, models.Suggestion{
			Category: "内容",
			Title:    "增加内容长度",
			Content:  fmt.Sprintf("当前内容约有%d字，建议增加到300字以上以提供更丰富的信息给用户和搜索引擎。", content.TotalWords),
			Level:    "warning",
		})
	} else {
		suggestions = append(suggestions, models.Suggestion{
			Category: "内容",
			Title:    "内容过短",
			Content:  fmt.Sprintf("当前内容仅有约%d字，内容过短难以获得好的排名，建议添加更多有价值的内容。", content.TotalWords),
			Level:    "error",
		})
	}

	if content.H1Count == 1 {
		score += 4
	} else if content.H1Count > 1 {
		score += 2
		suggestions = append(suggestions, models.Suggestion{
			Category: "内容",
			Title:    "减少H1标签",
			Content:  fmt.Sprintf("页面有%d个H1标签，建议每页只使用一个H1标签来明确页面主题。", content.H1Count),
			Level:    "warning",
		})
	} else {
		suggestions = append(suggestions, models.Suggestion{
			Category: "内容",
			Title:    "添加H1标签",
			Content:  "页面缺少H1标签，H1是页面最重要的标题标签，建议添加一个包含主要关键词的H1。",
			Level:    "error",
		})
	}

	if content.H2Count >= 1 {
		score += 3
	} else {
		suggestions = append(suggestions, models.Suggestion{
			Category: "内容",
			Title:    "添加H2子标题",
			Content:  "建议使用H2标签来组织内容结构，帮助用户和搜索引擎理解页面内容的层次。",
			Level:    "info",
		})
	}

	if content.ImgCount > 0 {
		altRatio := float64(content.ImgWithAlt) / float64(content.ImgCount)
		if altRatio >= 0.8 {
			score += 4
		} else if altRatio >= 0.5 {
			score += 2
			suggestions = append(suggestions, models.Suggestion{
				Category: "内容",
				Title:    "为更多图片添加Alt属性",
				Content:  fmt.Sprintf("当前有%d/%d张图片设置了Alt属性，建议为所有图片添加描述性的Alt属性以提高可访问性和图片搜索排名。", content.ImgWithAlt, content.ImgCount),
				Level:    "warning",
			})
		} else {
			suggestions = append(suggestions, models.Suggestion{
				Category: "内容",
				Title:    "为图片添加Alt属性",
				Content:  fmt.Sprintf("只有%d/%d张图片设置了Alt属性，Alt属性对图片SEO和可访问性都很重要。", content.ImgWithAlt, content.ImgCount),
				Level:    "error",
			})
		}
	}

	if content.HasFavicon {
		score++
	}
	if content.HasSitemap {
		score++
	}
	if content.HasRobotsTxt {
		score++
	}

	return score, suggestions
}

func extractKeywords(text string) map[string]int {
	text = strings.ToLower(text)
	words := make(map[string]int)

	var currentWord strings.Builder
	for _, r := range text {
		if isAlphanumeric(r) || isChineseChar(r) {
			currentWord.WriteRune(r)
		} else {
			if currentWord.Len() >= 2 {
				word := currentWord.String()
				if !isStopWord(word) {
					words[word]++
				}
			}
			currentWord.Reset()
		}
	}

	if currentWord.Len() >= 2 {
		word := currentWord.String()
		if !isStopWord(word) {
			words[word]++
		}
	}

	return words
}

func isAlphanumeric(r rune) bool {
	return (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9')
}

func isChineseChar(r rune) bool {
	return r >= 0x4e00 && r <= 0x9fff
}

var stopWordSet = map[string]bool{
	"the": true, "a": true, "an": true, "and": true, "or": true, "but": true,
	"in": true, "on": true, "at": true, "to": true, "for": true, "of": true,
	"with": true, "by": true, "from": true, "is": true, "are": true, "was": true,
	"were": true, "be": true, "been": true, "being": true, "have": true, "has": true,
	"had": true, "having": true, "do": true, "does": true, "did": true, "doing": true,
	"this": true, "that": true, "these": true, "those": true, "i": true, "you": true,
	"he": true, "she": true, "it": true, "we": true, "they": true, "what": true,
	"which": true, "who": true, "whom": true, "not": true, "no": true, "nor": true,
	"only": true, "own": true, "same": true, "such": true, "also": true, "as": true,
	"up": true, "out": true, "about": true, "into": true, "over": true, "after": true,
	"before": true, "between": true, "through": true, "during": true, "without": true,
	"under": true, "then": true, "here": true, "there": true, "when": true, "where": true,
	"how": true, "all": true, "each": true, "every": true, "both": true, "few": true,
	"more": true, "most": true, "other": true, "some": true, "if": true, "because": true,
	"while": true, "although": true, "though": true, "unless": true, "until": true,
	"的": true, "了": true, "在": true, "是": true, "我": true, "有": true, "和": true,
	"就": true, "不": true, "人": true, "都": true, "一": true, "上": true, "也": true,
	"很": true, "到": true, "说": true, "要": true, "去": true, "你": true, "会": true,
	"着": true, "没有": true, "看": true, "好": true, "自己": true, "这": true, "那": true,
	"被": true, "从": true, "把": true, "让": true, "用": true, "对": true, "为": true,
	"以": true, "及": true, "其": true, "但": true, "而": true, "与": true, "或": true,
	"如": true, "将": true,
}

func isStopWord(word string) bool {
	return stopWordSet[word]
}
