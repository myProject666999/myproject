package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/go-sql-driver/mysql"
	goredis "github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"

	"shortlink/internal/config"
	"shortlink/internal/middleware"
	"shortlink/internal/model"
	"shortlink/internal/types"
	"shortlink/pkg/bloom"
	"shortlink/pkg/codec"
	"shortlink/pkg/mqueue"
	"shortlink/pkg/sequence"
	"shortlink/pkg/util"
)

type svc struct {
	cfg    *config.Config
	db     *sql.DB
	rdb    *goredis.Client
	seq    *sequence.NumberAllocator
	bloom  *bloom.Filter
	queue  *mqueue.AccessQueue
	short  *model.ShortLinkRepo
	access *model.AccessLogRepo
	user   *model.UserRepo
}

func main() {
	var cfgPath string
	flag.StringVar(&cfgPath, "f", "etc/shortlink-api.yaml", "config file path")
	flag.Parse()

	cfg, err := config.Load(cfgPath)
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	db, err := sql.Open("mysql", cfg.Mysql.DataSource)
	if err != nil {
		log.Fatalf("open mysql: %v", err)
	}
	db.SetMaxOpenConns(64)
	db.SetMaxIdleConns(16)
	db.SetConnMaxLifetime(5 * time.Minute)
	db.SetConnMaxIdleTime(2 * time.Minute)

	rdb := goredis.NewClient(&goredis.Options{
		Addr:     cfg.Redis.Host,
		Password: cfg.Redis.Pass,
		DB:       cfg.Redis.DB,
	})
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		log.Printf("redis ping warn: %v", err)
	}

	s := &svc{
		cfg:    cfg,
		db:     db,
		rdb:    rdb,
		seq:    sequence.New(db, cfg.Sequence.Step),
		bloom:  bloom.New(rdb, cfg.Bloom.Key, cfg.Bloom.ExpectedInsertions, cfg.Bloom.FalsePositiveRate),
		queue:  mqueue.NewAccessQueue(rdb, cfg.MQueue.Stream, cfg.MQueue.Group, cfg.MQueue.Consumer, cfg.MQueue.BatchSize, time.Duration(cfg.MQueue.PullIntervalMs)*time.Millisecond),
		short:  model.NewShortLinkRepo(db),
		access: model.NewAccessLogRepo(db),
		user:   model.NewUserRepo(db),
	}

	go s.queue.Consume(context.Background(), s.handleAccessBatch)

	if err := s.warmBloom(context.Background()); err != nil {
		log.Printf("warm bloom warn: %v", err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/", s.handleAPI)
	mux.HandleFunc("/", s.handleRoot)

	srv := &http.Server{
		Addr:         fmt.Sprintf("%s:%d", cfg.Host, cfg.Port),
		Handler:      middleware.CORS(mux),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	log.Printf("shortlink listening on %s", srv.Addr)

	go func() {
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_ = srv.Shutdown(ctx)
}

// -----------------------------------------------------------------
// router
// -----------------------------------------------------------------

func (s *svc) handleRoot(w http.ResponseWriter, r *http.Request) {
	code := strings.TrimPrefix(r.URL.Path, "/")
	if code == "" {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	if strings.HasPrefix(code, "api/") {
		return
	}
	s.handleRedirect(w, r, code)
}

func (s *svc) handleAPI(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/api/")
	path = strings.TrimSuffix(path, "/")

	// auth-free endpoints
	switch {
	case path == "user/register" && r.Method == http.MethodPost:
		s.register(w, r)
		return
	case path == "user/login" && r.Method == http.MethodPost:
		s.login(w, r)
		return
	case path == "short/create" && r.Method == http.MethodPost:
		s.createShort(w, r)
		return
	case strings.HasPrefix(path, "short/stats/") && r.Method == http.MethodGet:
		code := strings.TrimPrefix(path, "short/stats/")
		s.stats(w, r, code)
		return
	}

	// endpoints requiring auth
	uid, ok := middleware.AuthUserID(r, s.cfg.Auth.AccessSecret)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, types.Resp{Code: 401, Msg: "未登录或登录已过期"})
		return
	}
	switch {
	case path == "short/list" && r.Method == http.MethodGet:
		s.listShort(w, r, uid)
	case path == "short/status" && r.Method == http.MethodPost:
		s.setStatus(w, r, uid)
	case path == "short/delete" && r.Method == http.MethodPost:
		s.deleteShort(w, r, uid)
	case path == "user/me" && r.Method == http.MethodGet:
		s.me(w, r, uid)
	default:
		http.Error(w, "not found", http.StatusNotFound)
	}
}

// -----------------------------------------------------------------
// redirect
// -----------------------------------------------------------------

func (s *svc) handleRedirect(w http.ResponseWriter, r *http.Request, code string) {
	ctx := r.Context()
	may, err := s.bloom.MightContain(ctx, code)
	if err != nil {
		log.Printf("bloom err: %v", err)
	}
	if !may {
		http.NotFound(w, r)
		return
	}
	cacheKey := "sl:url:" + code
	cached, err := s.rdb.Get(ctx, cacheKey).Result()
	if err == nil && cached != "" {
		s.enqueueAccess(r, code, 0)
		http.Redirect(w, r, cached, http.StatusFound)
		return
	}
	sl, err := s.short.GetByCode(ctx, code)
	if err != nil || sl == nil {
		http.NotFound(w, r)
		return
	}
	if sl.Status != 1 {
		writeJSON(w, http.StatusForbidden, types.Resp{Code: 403, Msg: "链接已被禁用"})
		return
	}
	if sl.ExpireAt != nil && sl.ExpireAt.Before(time.Now()) {
		writeJSON(w, http.StatusGone, types.Resp{Code: 410, Msg: "链接已过期"})
		return
	}
	_ = s.rdb.Set(ctx, cacheKey, sl.URL, 24*time.Hour).Err()
	_ = s.bloom.Add(ctx, code)

	s.enqueueAccess(r, code, sl.ID)
	http.Redirect(w, r, sl.URL, http.StatusFound)
}

func (s *svc) enqueueAccess(r *http.Request, code string, linkID uint64) {
	ip := r.RemoteAddr
	if idx := strings.LastIndex(ip, ":"); idx > 0 {
		ip = ip[:idx]
	}
	ua := r.Header.Get("User-Agent")
	ref := r.Header.Get("Referer")
	if len(ua) > 512 {
		ua = ua[:512]
	}
	if len(ref) > 512 {
		ref = ref[:512]
	}
	_ = s.queue.Push(r.Context(), mqueue.AccessMsg{
		Code:        code,
		ShortLinkID: linkID,
		IP:          ip,
		UserAgent:   ua,
		Referer:     ref,
	})
}

// -----------------------------------------------------------------
// short create
// -----------------------------------------------------------------

func (s *svc) createShort(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var req types.CreateShortReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, types.Resp{Code: 400, Msg: "请求参数格式错误"})
		return
	}
	if _, err := url.ParseRequestURI(req.URL); err != nil {
		writeJSON(w, http.StatusBadRequest, types.Resp{Code: 400, Msg: "URL格式不正确，请输入完整的URL（包含http://或https://）"})
		return
	}

	var uidPtr *uint64
	if uid, ok := middleware.AuthUserID(r, s.cfg.Auth.AccessSecret); ok {
		uidPtr = &uid
	}

	if req.CustomCode != "" {
		exists, _ := s.short.GetByCode(ctx, req.CustomCode)
		if exists != nil {
			writeJSON(w, http.StatusConflict, types.Resp{Code: 409, Msg: "自定义短码已被占用"})
			return
		}
		sl := &model.ShortLink{
			Code:     req.CustomCode,
			URL:      req.URL,
			URLHash:  util.MD5Hex(req.URL),
			UserID:   uidPtr,
			Status:   1,
			IsCustom: 1,
		}
		if req.ExpireAt != "" {
			t, err := time.Parse(time.RFC3339, req.ExpireAt)
			if err != nil {
				writeJSON(w, http.StatusBadRequest, types.Resp{Code: 400, Msg: "过期时间格式不正确"})
				return
			}
			sl.ExpireAt = &t
		}
		if err := s.short.Insert(ctx, sl); err != nil {
			log.Printf("insert custom: %v", err)
			writeJSON(w, http.StatusInternalServerError, types.Resp{Code: 500, Msg: "服务器内部错误"})
			return
		}
		_ = s.bloom.Add(ctx, sl.Code)
		writeJSON(w, http.StatusOK, types.Resp{
			Code: 0, Data: types.ShortResp{
				ShortLink: s.cfg.ShortDomain + "/" + sl.Code,
				Code:      sl.Code,
				URL:       sl.URL,
			},
		})
		return
	}

	hash := util.MD5Hex(req.URL)
	if existing, err := s.short.GetByURLHash(ctx, hash); err == nil && existing != nil {
		_ = s.bloom.Add(ctx, existing.Code)
		writeJSON(w, http.StatusOK, types.Resp{
			Code: 0, Data: types.ShortResp{
				ShortLink: s.cfg.ShortDomain + "/" + existing.Code,
				Code:      existing.Code,
				URL:       existing.URL,
			},
		})
		return
	}

	num, err := s.seq.Next(ctx)
	if err != nil {
		log.Printf("alloc seq: %v", err)
		writeJSON(w, http.StatusInternalServerError, types.Resp{Code: 500, Msg: "服务器内部错误"})
		return
	}
	code := codec.Encode(num)

	sl := &model.ShortLink{
		Code:     code,
		URL:      req.URL,
		URLHash:  hash,
		UserID:   uidPtr,
		Status:   1,
		IsCustom: 0,
	}
	if req.ExpireAt != "" {
		t, err := time.Parse(time.RFC3339, req.ExpireAt)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, types.Resp{Code: 400, Msg: "过期时间格式不正确"})
			return
		}
		sl.ExpireAt = &t
	}

	if err := s.short.Insert(ctx, sl); err != nil {
		if isDuplicate(err) {
			num2, err2 := s.seq.Next(ctx)
			if err2 != nil {
				writeJSON(w, http.StatusInternalServerError, types.Resp{Code: 500, Msg: "服务器内部错误"})
				return
			}
			sl.Code = codec.Encode(num2)
			if err2 := s.short.Insert(ctx, sl); err2 != nil {
				writeJSON(w, http.StatusInternalServerError, types.Resp{Code: 500, Msg: "服务器内部错误"})
				return
			}
		} else {
			writeJSON(w, http.StatusInternalServerError, types.Resp{Code: 500, Msg: "服务器内部错误"})
			return
		}
	}
	_ = s.bloom.Add(ctx, sl.Code)
	writeJSON(w, http.StatusOK, types.Resp{
		Code: 0, Data: types.ShortResp{
			ShortLink: s.cfg.ShortDomain + "/" + sl.Code,
			Code:      sl.Code,
			URL:       sl.URL,
		},
	})
}

func (s *svc) listShort(w http.ResponseWriter, r *http.Request, uid uint64) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	size, _ := strconv.Atoi(r.URL.Query().Get("size"))
	list, total, err := s.short.ListByUser(r.Context(), uid, page, size)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, types.Resp{Code: 500, Msg: "服务器内部错误"})
		return
	}
	writeJSON(w, http.StatusOK, types.Resp{Code: 0, Data: types.ListResp{List: list, Total: total}})
}

func (s *svc) setStatus(w http.ResponseWriter, r *http.Request, uid uint64) {
	var req types.SetStatusReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, types.Resp{Code: 400, Msg: "请求参数格式错误"})
		return
	}
	if err := s.short.UpdateStatus(r.Context(), req.ID, uid, req.Status); err != nil {
		writeJSON(w, http.StatusInternalServerError, types.Resp{Code: 500, Msg: "服务器内部错误"})
		return
	}
	writeJSON(w, http.StatusOK, types.Resp{Code: 0})
}

func (s *svc) deleteShort(w http.ResponseWriter, r *http.Request, uid uint64) {
	var req types.SetStatusReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, types.Resp{Code: 400, Msg: "请求参数格式错误"})
		return
	}
	if err := s.short.Delete(r.Context(), req.ID, uid); err != nil {
		writeJSON(w, http.StatusInternalServerError, types.Resp{Code: 500, Msg: "服务器内部错误"})
		return
	}
	writeJSON(w, http.StatusOK, types.Resp{Code: 0})
}

func (s *svc) stats(w http.ResponseWriter, r *http.Request, code string) {
	ctx := r.Context()
	days := 7
	if d, err := strconv.Atoi(r.URL.Query().Get("days")); err == nil && d > 0 {
		days = d
	}
	trend, err := s.access.DailyTrend(ctx, code, days)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, types.Resp{Code: 500, Msg: "服务器内部错误"})
		return
	}
	sl, _ := s.short.GetByCode(ctx, code)
	var total int64
	if sl != nil {
		total = int64(sl.ClickCount)
	}
	daily := make([]types.DailyPoint, 0, len(trend))
	for _, t := range trend {
		daily = append(daily, types.DailyPoint{Day: t.Day, Cnt: t.Cnt})
	}
	writeJSON(w, http.StatusOK, types.Resp{Code: 0, Data: types.StatsResp{
		Code:  code,
		Total: total,
		Daily: daily,
	}})
}

// -----------------------------------------------------------------
// user
// -----------------------------------------------------------------

func (s *svc) register(w http.ResponseWriter, r *http.Request) {
	var req types.LoginReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, types.Resp{Code: 400, Msg: "请求参数格式错误"})
		return
	}
	if req.Username == "" || len(req.Password) < 6 {
		writeJSON(w, http.StatusBadRequest, types.Resp{Code: 400, Msg: "用户名不能为空且密码至少6位"})
		return
	}
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, types.Resp{Code: 500, Msg: "服务器内部错误"})
		return
	}
	u := &model.User{
		Username: req.Username,
		Password: string(hashed),
		Email:    req.Email,
		Status:   1,
	}
	if err := s.user.Insert(r.Context(), u); err != nil {
		if isDuplicate(err) {
			writeJSON(w, http.StatusConflict, types.Resp{Code: 409, Msg: "用户名已被占用"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, types.Resp{Code: 500, Msg: "服务器内部错误"})
		return
	}
	writeJSON(w, http.StatusOK, types.Resp{Code: 0, Data: types.LoginResp{UserID: u.ID, Username: u.Username}})
}

func (s *svc) login(w http.ResponseWriter, r *http.Request) {
	var req types.LoginReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, types.Resp{Code: 400, Msg: "请求参数格式错误"})
		return
	}
	u, err := s.user.GetByUsername(r.Context(), req.Username)
	if err != nil || u == nil {
		writeJSON(w, http.StatusUnauthorized, types.Resp{Code: 401, Msg: "用户名或密码错误"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(req.Password)); err != nil {
		writeJSON(w, http.StatusUnauthorized, types.Resp{Code: 401, Msg: "用户名或密码错误"})
		return
	}
	token, err := middleware.SignToken(u.ID, u.Username, s.cfg.Auth.AccessSecret, s.cfg.Auth.AccessExpire)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, types.Resp{Code: 500, Msg: "服务器内部错误"})
		return
	}
	writeJSON(w, http.StatusOK, types.Resp{Code: 0, Data: types.LoginResp{
		UserID:   u.ID,
		Username: u.Username,
		Token:    token,
	}})
}

func (s *svc) me(w http.ResponseWriter, r *http.Request, uid uint64) {
	u, err := s.user.GetByID(r.Context(), uid)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, types.Resp{Code: 500, Msg: "服务器内部错误"})
		return
	}
	u.Password = ""
	writeJSON(w, http.StatusOK, types.Resp{Code: 0, Data: u})
}

// -----------------------------------------------------------------
// helpers
// -----------------------------------------------------------------

func (s *svc) handleAccessBatch(ctx context.Context, batch []mqueue.AccessMsg) {
	if len(batch) == 0 {
		return
	}
	logs := make([]model.AccessLog, 0, len(batch))
	incr := map[uint64]int{}
	for _, m := range batch {
		slID := m.ShortLinkID
		if slID == 0 && m.Code != "" {
			if sl, err := s.short.GetByCode(ctx, m.Code); err == nil && sl != nil {
				slID = sl.ID
			}
		}
		var idPtr *uint64
		if slID > 0 {
			idPtr = &slID
			incr[slID]++
		}
		logs = append(logs, model.AccessLog{
			Code:        m.Code,
			ShortLinkID: idPtr,
			IP:          m.IP,
			UserAgent:   m.UserAgent,
			Referer:     m.Referer,
		})
	}
	if len(logs) > 0 {
		if err := s.access.BatchInsert(ctx, logs); err != nil {
			log.Printf("batch insert logs: %v", err)
		}
	}
	for id, n := range incr {
		_, err := s.db.ExecContext(ctx, "UPDATE short_link SET click_count=click_count+? WHERE id=?", n, id)
		if err != nil {
			log.Printf("increment click: %v", err)
		}
	}
}

func (s *svc) warmBloom(ctx context.Context) error {
	rows, err := s.db.QueryContext(ctx, "SELECT code FROM short_link")
	if err != nil {
		return err
	}
	defer rows.Close()
	n := 0
	for rows.Next() {
		var code string
		if err := rows.Scan(&code); err != nil {
			return err
		}
		_ = s.bloom.Add(ctx, code)
		n++
	}
	log.Printf("bloom warmed with %d codes", n)
	return nil
}

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func isDuplicate(err error) bool {
	var me *mysql.MySQLError
	if errors.As(err, &me) && me.Number == 1062 {
		return true
	}
	return false
}
