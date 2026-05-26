package services

import (
	"context"
	"encoding/base64"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/chromedp/cdproto/page"
	"github.com/chromedp/chromedp"
	"github.com/google/uuid"
)

type PDFOptions struct {
	URL        string
	Style      string
	EnableTOC  bool
	Pagination string
	Title      string
}

type TOCItem struct {
	Text     string
	Level    int
	Selector string
}

func ConvertWebpageToPDF(opts PDFOptions, outputDir string) (string, int, error) {
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		return "", 0, fmt.Errorf("创建输出目录失败: %v", err)
	}

	filename := fmt.Sprintf("%s_%s.pdf", sanitizeFilename(opts.Title), uuid.New().String()[:8])
	filepath := filepath.Join(outputDir, filename)

	allocCtx, cancel := chromedp.NewContext(context.Background())
	defer cancel()

	ctx, cancel := context.WithTimeout(allocCtx, 60*time.Second)
	defer cancel()

	var pdfBuf []byte
	var pageCount int
	var tocItems []TOCItem

	err := chromedp.Run(ctx,
		chromedp.Navigate(opts.URL),
		chromedp.Sleep(2*time.Second),
		chromedp.WaitReady("body", chromedp.ByQuery),
		injectCustomStyles(opts.Style),
		extractTOC(&tocItems),
		generatePDF(&pdfBuf, opts, &pageCount),
	)

	if err != nil {
		return "", 0, fmt.Errorf("转换PDF失败: %v", err)
	}

	if opts.EnableTOC && len(tocItems) > 0 {
		tocHTML := generateTOCHTML(tocItems)
		pdfBuf, err = insertTOCToPDF(pdfBuf, tocHTML, opts)
		if err != nil {
			fmt.Printf("插入目录失败: %v，使用原始PDF\n", err)
		}
	}

	if err := ioutil.WriteFile(filepath, pdfBuf, 0644); err != nil {
		return "", 0, fmt.Errorf("保存PDF失败: %v", err)
	}

	return filename, pageCount, nil
}

func sanitizeFilename(name string) string {
	if name == "" {
		name = "webpage"
	}
	replacer := strings.NewReplacer(
		"/", "_", "\\", "_", ":", "_", "*", "_", "?", "_",
		"\"", "_", "<", "_", ">", "_", "|", "_", " ", "_",
	)
	return replacer.Replace(name)
}

func injectCustomStyles(style string) chromedp.Action {
	css := getStyleCSS(style)
	script := fmt.Sprintf(`
		(function() {
			var style = document.createElement('style');
			style.textContent = %q;
			document.head.appendChild(style);
			
			window.print = function() {};
			
			var pageStyle = document.createElement('style');
			pageStyle.textContent = %q;
			document.head.appendChild(pageStyle);
		})();
	`, css, getPageCSS())
	return chromedp.Evaluate(script, nil)
}

func getStyleCSS(style string) string {
	switch style {
	case "clean":
		return `
			body { font-family: 'Microsoft YaHei', Arial, sans-serif; background: #fff !important; }
			header, footer, nav, .sidebar, .advertisement, .ads, [class*='ad-'] { display: none !important; }
			main, .content, article { max-width: 800px; margin: 0 auto; padding: 20px; }
			img { max-width: 100% !important; height: auto !important; }
			h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }
		`
	case "dark":
		return `
			body { font-family: 'Microsoft YaHei', Arial, sans-serif; background: #1a1a1a !important; color: #e0e0e0 !important; }
			* { background-color: #1a1a1a !important; color: #e0e0e0 !important; }
			header, footer, nav, .sidebar { display: none !important; }
			main, article { max-width: 800px; margin: 0 auto; padding: 20px; }
			img { max-width: 100% !important; height: auto !important; filter: brightness(0.8); }
		`
	case "ebook":
		return `
			body { font-family: 'Georgia', 'SimSun', serif; font-size: 16px; line-height: 1.8; background: #f5f5dc !important; }
			header, footer, nav, .sidebar { display: none !important; }
			article { max-width: 700px; margin: 0 auto; padding: 40px; }
			h1 { text-align: center; margin-bottom: 40px; }
			p { text-indent: 2em; margin-bottom: 1em; }
			img { max-width: 100% !important; height: auto !important; }
		`
	default:
		return `
			@media print {
				body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
				.no-print { display: none !important; }
			}
			img { max-width: 100% !important; height: auto !important; }
		`
	}
}

func getPageCSS() string {
	return `
		@media print {
			@page {
				size: A4;
				margin: 2cm;
				@top-center { content: element(header); }
				@bottom-center { content: "第 " counter(page) " 页 / 共 " counter(pages) " 页"; }
			}
			.page-break { page-break-before: always; }
			h1, h2, h3 { page-break-after: avoid; }
			table, figure { page-break-inside: avoid; }
		}
	`
}

func extractTOC(tocItems *[]TOCItem) chromedp.Action {
	script := `
		(function() {
			var items = [];
			var headings = document.querySelectorAll('h1, h2, h3, h4');
			headings.forEach(function(h, index) {
				var id = 'toc-' + index;
				h.id = id;
				items.push({
					text: h.textContent.trim(),
					level: parseInt(h.tagName.charAt(1)),
					selector: '#' + id
				});
			});
			return items;
		})();
	`
	return chromedp.Evaluate(script, tocItems)
}

func generatePDF(pdfBuf *[]byte, opts PDFOptions, pageCount *int) chromedp.Action {
	return chromedp.ActionFunc(func(ctx context.Context) error {
		paperWidth, paperHeight := getPageSize(opts.Pagination)

		buf, _, err := page.PrintToPDF().
			WithPrintBackground(true).
			WithPaperWidth(paperWidth).
			WithPaperHeight(paperHeight).
			WithMarginTop(2.0).
			WithMarginBottom(2.0).
			WithMarginLeft(1.5).
			WithMarginRight(1.5).
			WithDisplayHeaderFooter(true).
			WithHeaderTemplate(`<div style="font-size: 10px; text-align: center; width: 100%"></div>`).
			WithFooterTemplate(`
				<div style="font-size: 10px; text-align: center; width: 100%">
					第 <span class="pageNumber"></span> 页 / 共 <span class="totalPages"></span> 页
				</div>
			`).
			Do(ctx)

		if err != nil {
			return err
		}

		*pdfBuf = buf
		*pageCount = estimatePageCount(buf)
		return nil
	})
}

func getPageSize(pagination string) (float64, float64) {
	switch pagination {
	case "A3":
		return 11.69, 16.54
	case "A5":
		return 4.13, 5.83
	case "Letter":
		return 8.5, 11
	case "Legal":
		return 8.5, 14
	default:
		return 8.27, 11.69
	}
}

func estimatePageCount(buf []byte) int {
	content := string(buf)
	count := strings.Count(content, "/Type /Page\n")
	if count == 0 {
		count = strings.Count(content, "/Type/Page")
	}
	if count == 0 {
		count = 1
	}
	return count
}

func generateTOCHTML(items []TOCItem) string {
	var html strings.Builder
	html.WriteString(`
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8">
			<title>目录</title>
			<style>
				body { font-family: 'Microsoft YaHei', Arial, sans-serif; padding: 40px; }
				h1 { text-align: center; margin-bottom: 30px; font-size: 24px; }
				.toc-list { list-style: none; padding: 0; }
				.toc-item { margin: 8px 0; cursor: pointer; }
				.toc-item.level-1 { padding-left: 0; font-size: 16px; font-weight: bold; }
				.toc-item.level-2 { padding-left: 20px; font-size: 14px; }
				.toc-item.level-3 { padding-left: 40px; font-size: 13px; }
				.toc-item.level-4 { padding-left: 60px; font-size: 12px; }
				.toc-item a { color: #333; text-decoration: none; display: flex; justify-content: space-between; }
				.toc-item a:hover { color: #1a73e8; }
				.dots { flex: 1; border-bottom: 1px dotted #ccc; margin: 0 10px; }
			</style>
		</head>
		<body>
			<h1>目 录</h1>
			<ul class="toc-list">
	`)

	for _, item := range items {
		html.WriteString(fmt.Sprintf(`
			<li class="toc-item level-%d">
				<a href="#%s">
					<span>%s</span>
					<span class="dots"></span>
					<span></span>
				</a>
			</li>
		`, item.Level, strings.TrimPrefix(item.Selector, "#"), item.Text))
	}

	html.WriteString(`
			</ul>
		</body>
		</html>
	`)

	return html.String()
}

func insertTOCToPDF(originalPDF []byte, tocHTML string, opts PDFOptions) ([]byte, error) {
	allocCtx, cancel := chromedp.NewContext(context.Background())
	defer cancel()

	ctx, cancel := context.WithTimeout(allocCtx, 30*time.Second)
	defer cancel()

	var tocPDF []byte
	err := chromedp.Run(ctx,
		chromedp.Navigate("data:text/html;base64,"+base64.StdEncoding.EncodeToString([]byte(tocHTML))),
		chromedp.Sleep(1*time.Second),
		chromedp.ActionFunc(func(ctx context.Context) error {
			paperWidth, paperHeight := getPageSize(opts.Pagination)
			buf, _, err := page.PrintToPDF().
				WithPrintBackground(true).
				WithPaperWidth(paperWidth).
				WithPaperHeight(paperHeight).
				WithMarginTop(2.0).
				WithMarginBottom(2.0).
				WithMarginLeft(1.5).
				WithMarginRight(1.5).
				Do(ctx)
			if err != nil {
				return err
			}
			tocPDF = buf
			return nil
		}),
	)

	if err != nil {
		return originalPDF, err
	}

	return mergePDFs(tocPDF, originalPDF), nil
}

func mergePDFs(pdf1, pdf2 []byte) []byte {
	s1 := string(pdf1)
	s2 := string(pdf2)

	idx1 := strings.LastIndex(s1, "%%EOF")
	idx2 := strings.Index(s2, "%%EOF")

	if idx1 == -1 || idx2 == -1 {
		return append(pdf1, pdf2...)
	}

	result := s1[:idx1] + s2[:idx2] + "%%EOF\n"
	return []byte(result)
}
