package handler

import (
	"database/sql"
	"net/http"
	"time"
	"wifipwd/internal/crypto"
	"wifipwd/internal/model"
	"wifipwd/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/skip2/go-qrcode"
)

type NetworkHandler struct {
	Repo  *repository.NetworkRepo
	Share *repository.ShareRepo
	Crypt *crypto.Service
}

func NewNetworkHandler(r *repository.NetworkRepo, s *repository.ShareRepo, c *crypto.Service) *NetworkHandler {
	return &NetworkHandler{Repo: r, Share: s, Crypt: c}
}

func parseTimePtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func rowToNetwork(row *repository.NetworkRow, crypt *crypto.Service, includePwd bool) (*model.Network, error) {
	pwd, err := crypt.Decrypt(row.EncPassword, row.EncIV, row.EncTag)
	if err != nil {
		return nil, err
	}
	created, _ := time.Parse(time.RFC3339, row.CreatedAt)
	updated, _ := time.Parse(time.RFC3339, row.UpdatedAt)
	n := &model.Network{
		ID:        row.ID,
		SSID:      row.SSID,
		Security:  row.Security,
		Notes:     row.Notes,
		Owner:     row.Owner,
		CreatedAt: created,
		UpdatedAt: updated,
	}
	if row.ExpiresAt.Valid {
		n.ExpiresAt = &row.ExpiresAt.String
		if t, err := time.Parse(time.RFC3339, row.ExpiresAt.String); err == nil {
			n.Expired = t.Before(time.Now().UTC())
		}
	}
	if includePwd {
		n.Password = string(pwd)
	}
	return n, nil
}

func (h *NetworkHandler) List(c *gin.Context) {
	rows, err := h.Repo.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	out := make([]model.Network, 0, len(rows))
	for _, row := range rows {
		r := row
		n, err := rowToNetwork(&r, h.Crypt, false)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		out = append(out, *n)
	}
	c.JSON(http.StatusOK, out)
}

func (h *NetworkHandler) Get(c *gin.Context) {
	id := c.Param("id")
	row, err := h.Repo.Get(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if row == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	n, err := rowToNetwork(row, h.Crypt, true)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, n)
}

type networkReq struct {
	SSID      string  `json:"ssid" binding:"required"`
	Security  string  `json:"security"`
	Password  string  `json:"password" binding:"required"`
	Notes     string  `json:"notes"`
	Owner     string  `json:"owner"`
	ExpiresAt *string `json:"expiresAt"`
}

func (h *NetworkHandler) Create(c *gin.Context) {
	var req networkReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Security == "" {
		req.Security = "WPA"
	}
	enc, iv, tag, err := h.Crypt.Encrypt([]byte(req.Password))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	n := &model.Network{
		SSID:      req.SSID,
		Security:  req.Security,
		Password:  req.Password,
		Notes:     req.Notes,
		Owner:     req.Owner,
		ExpiresAt: req.ExpiresAt,
	}
	row, err := h.Repo.Create(n, enc, iv, tag)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	out, err := rowToNetwork(row, h.Crypt, true)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, out)
}

func (h *NetworkHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req networkReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Security == "" {
		req.Security = "WPA"
	}
	enc, iv, tag, err := h.Crypt.Encrypt([]byte(req.Password))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	n := &model.Network{
		ID:        id,
		SSID:      req.SSID,
		Security:  req.Security,
		Password:  req.Password,
		Notes:     req.Notes,
		Owner:     req.Owner,
		ExpiresAt: req.ExpiresAt,
	}
	row, err := h.Repo.Update(n, enc, iv, tag)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if row == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	out, err := rowToNetwork(row, h.Crypt, true)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, out)
}

func (h *NetworkHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.Repo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *NetworkHandler) QR(c *gin.Context) {
	id := c.Param("id")
	row, err := h.Repo.Get(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if row == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	pwd, err := h.Crypt.Decrypt(row.EncPassword, row.EncIV, row.EncTag)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	sec := row.Security
	if sec == "" {
		sec = "WPA"
	}
	content := "WIFI:T:" + sec + ";S:" + row.SSID + ";P:" + string(pwd) + ";;"
	png, err := qrcode.Encode(content, qrcode.Medium, 256)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Data(http.StatusOK, "image/png", png)
}

type shareReq struct {
	ExpiresAt *string `json:"expiresAt"`
}

func (h *NetworkHandler) CreateShare(c *gin.Context) {
	id := c.Param("id")
	row, err := h.Repo.Get(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if row == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	var req shareReq
	_ = c.ShouldBindJSON(&req)
	s, err := h.Share.Create(id, req.ExpiresAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"id":         s.ID,
		"networkId":  s.NetworkID,
		"token":      s.Token,
		"expiresAt":  nullStrPtr(s.ExpiresAt),
		"visitCount": s.VisitCount,
		"createdAt":  s.CreatedAt,
	})
}

func (h *NetworkHandler) ListShares(c *gin.Context) {
	id := c.Param("id")
	list, err := h.Share.ListByNetwork(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	out := make([]gin.H, 0, len(list))
	for _, s := range list {
		out = append(out, gin.H{
			"id":         s.ID,
			"networkId":  s.NetworkID,
			"token":      s.Token,
			"expiresAt":  nullStrPtr(s.ExpiresAt),
			"visitCount": s.VisitCount,
			"createdAt":  s.CreatedAt,
		})
	}
	c.JSON(http.StatusOK, out)
}

func (h *NetworkHandler) DeleteShare(c *gin.Context) {
	id := c.Param("shareId")
	if err := h.Share.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

func (h *NetworkHandler) GetByShare(c *gin.Context) {
	token := c.Param("token")
	s, err := h.Share.GetByToken(token)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if s == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	if s.ExpiresAt.Valid {
		if t, err := time.Parse(time.RFC3339, s.ExpiresAt.String); err == nil && t.Before(time.Now().UTC()) {
			c.JSON(http.StatusGone, gin.H{"error": "share expired"})
			return
		}
	}
	row, err := h.Repo.Get(s.NetworkID)
	if err != nil || row == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	if row.ExpiresAt.Valid {
		if t, err := time.Parse(time.RFC3339, row.ExpiresAt.String); err == nil && t.Before(time.Now().UTC()) {
			c.JSON(http.StatusGone, gin.H{"error": "network expired"})
			return
		}
	}
	_ = h.Share.IncVisit(s.ID)
	n, err := rowToNetwork(row, h.Crypt, true)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, n)
}

func (h *NetworkHandler) Expired(c *gin.Context) {
	rows, err := h.Repo.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	now := time.Now().UTC()
	out := make([]model.Network, 0)
	for _, row := range rows {
		r := row
		if !r.ExpiresAt.Valid {
			continue
		}
		t, err := time.Parse(time.RFC3339, r.ExpiresAt.String)
		if err != nil || t.After(now) {
			continue
		}
		n, err := rowToNetwork(&r, h.Crypt, false)
		if err != nil {
			continue
		}
		out = append(out, *n)
	}
	c.JSON(http.StatusOK, out)
}

func nullStrPtr(ns sql.NullString) *string {
	if !ns.Valid {
		return nil
	}
	s := ns.String
	return &s
}
