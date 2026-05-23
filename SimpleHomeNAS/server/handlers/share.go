package handlers

import (
	"archive/zip"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"simplehomenas/database"
)

type ShareHandler struct {
	Root string
}

func NewShareHandler(root string) *ShareHandler {
	return &ShareHandler{Root: root}
}

func (h *ShareHandler) sanitize(p string) (string, error) {
	p = filepath.Clean("/" + strings.ReplaceAll(p, "\\", "/"))
	p = strings.TrimPrefix(p, "/")
	full := filepath.Join(h.Root, p)
	absRoot, _ := filepath.Abs(h.Root)
	absFull, _ := filepath.Abs(full)
	if !strings.HasPrefix(absFull, absRoot) {
		return "", fmt.Errorf("invalid path")
	}
	return absFull, nil
}

func genToken() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func (h *ShareHandler) Create(c *gin.Context) {
	var req struct {
		Path      string `json:"path"`
		ExpireSec int    `json:"expire_sec"`
		MaxAccess int    `json:"max_access"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Path == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "path required"})
		return
	}
	full, err := h.sanitize(req.Path)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	info, err := os.Stat(full)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "path not found"})
		return
	}
	var expireAt *time.Time
	if req.ExpireSec > 0 {
		t := time.Now().Add(time.Duration(req.ExpireSec) * time.Second)
		expireAt = &t
	}
	s := &database.Share{
		Token:     genToken(),
		Path:      req.Path,
		IsDir:     info.IsDir(),
		ExpireAt:  expireAt,
		MaxAccess: req.MaxAccess,
	}
	if err := database.CreateShare(s); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"token": s.Token,
		"url":   "/s/" + s.Token,
	})
}

func (h *ShareHandler) List(c *gin.Context) {
	shares, err := database.ListShares()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"shares": shares})
}

func (h *ShareHandler) Delete(c *gin.Context) {
	var req struct {
		ID uint `json:"id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := database.DeleteShare(req.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func (h *ShareHandler) Access(c *gin.Context) {
	token := c.Param("token")
	s, err := database.GetShareByToken(token)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "share not found"})
		return
	}
	if s.Expired() {
		c.JSON(http.StatusGone, gin.H{"error": "share expired"})
		return
	}
	if s.Maxed() {
		c.JSON(http.StatusGone, gin.H{"error": "share access limit reached"})
		return
	}
	full, err := h.sanitize(s.Path)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	info, err := os.Stat(full)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "path not found"})
		return
	}
	if info.IsDir() {
		sub := c.Query("sub")
		if sub == "" {
			entries, err := os.ReadDir(full)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			items := make([]FileItem, 0, len(entries))
			for _, e := range entries {
				i, err := e.Info()
				if err != nil {
					continue
				}
				items = append(items, FileItem{
					Name:    e.Name(),
					Path:    e.Name(),
					IsDir:   e.IsDir(),
					Size:    i.Size(),
					ModTime: i.ModTime(),
				})
			}
			if err := database.IncShareAccess(s.ID); err != nil {
				_ = err
			}
			c.JSON(http.StatusOK, gin.H{
				"path":  s.Path,
				"items": items,
			})
			return
		}
		subFull, err := h.sanitize(filepath.Join(s.Path, sub))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		subInfo, err := os.Stat(subFull)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		if subInfo.IsDir() {
			c.JSON(http.StatusBadRequest, gin.H{"error": "nested dir download not supported"})
			return
		}
		if err := database.IncShareAccess(s.ID); err != nil {
			_ = err
		}
		c.FileAttachment(subFull, subInfo.Name())
		return
	}
	if err := database.IncShareAccess(s.ID); err != nil {
		_ = err
	}
	c.FileAttachment(full, info.Name())
}

func (h *ShareHandler) DownloadZip(c *gin.Context) {
	token := c.Param("token")
	s, err := database.GetShareByToken(token)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "share not found"})
		return
	}
	if !s.IsDir {
		c.JSON(http.StatusBadRequest, gin.H{"error": "not a directory"})
		return
	}
	if s.Expired() || s.Maxed() {
		c.JSON(http.StatusGone, gin.H{"error": "share invalid"})
		return
	}
	full, err := h.sanitize(s.Path)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	base := filepath.Base(strings.TrimRight(full, string(os.PathSeparator)))
	if base == "" || base == string(os.PathSeparator) {
		base = "share"
	}
	c.Header("Content-Type", "application/zip")
	c.Header("Content-Disposition", `attachment; filename="`+base+`.zip"`)
	zw := zip.NewWriter(c.Writer)
	defer zw.Close()
	err = filepath.Walk(full, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		absPath, _ := filepath.Abs(path)
		rel, _ := filepath.Rel(full, absPath)
		if rel == "." {
			rel = ""
		}
		header, err := zip.FileInfoHeader(info)
		if err != nil {
			return err
		}
		header.Name = filepath.ToSlash(filepath.Join(base, rel))
		if info.IsDir() {
			header.Name += "/"
			_, err = zw.CreateHeader(header)
			return err
		}
		header.Method = zip.Deflate
		w, err := zw.CreateHeader(header)
		if err != nil {
			return err
		}
		f, err := os.Open(path)
		if err != nil {
			return err
		}
		defer f.Close()
		_, err = io.Copy(w, f)
		return err
	})
	if err != nil {
		_ = err
	}
	_ = database.IncShareAccess(s.ID)
}
