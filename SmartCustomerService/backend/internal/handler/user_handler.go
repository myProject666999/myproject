package handler

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"smart-customer-service/internal/svc"
	"smart-customer-service/internal/types"

	"github.com/golang-jwt/jwt/v4"
	"github.com/zeromicro/go-zero/rest/httpx"
	"golang.org/x/crypto/bcrypt"
)

type CustomClaims struct {
	UserId   int64  `json:"userId"`
	Username string `json:"username"`
	Role     int    `json:"role"`
	jwt.RegisteredClaims
}

func LoginHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.LoginReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("参数错误"))
			return
		}

		var id int64
		var username, password string
		var realName, email, phone, avatar sql.NullString
		var role int
		var department, skillTags sql.NullString
		var onlineStatus int

		err := svcCtx.DB.QueryRow(`
			SELECT id, username, password, real_name, email, phone, avatar, role, department, skill_tags, online_status
			FROM user WHERE username = ? AND status = 1 AND deleted_at IS NULL
		`, req.Username).Scan(&id, &username, &password, &realName, &email, &phone, &avatar, &role, &department, &skillTags, &onlineStatus)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("用户名或密码错误"))
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(password), []byte(req.Password)); err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("用户名或密码错误"))
			return
		}

		now := time.Now()
		svcCtx.DB.Exec(`UPDATE user SET online_status = 1, last_online_at = ? WHERE id = ?`, now, id)

		token := generateJWTToken(svcCtx.Config.Auth.AccessSecret, svcCtx.Config.Auth.AccessExpire, id, username, role)

		resp := types.LoginResp{
			AccessToken: token,
			ExpireAt:    now.Add(time.Duration(svcCtx.Config.Auth.AccessExpire) * time.Second).Unix(),
			UserInfo: types.UserInfo{
				Id:           id,
				Username:     username,
				RealName:     nullString(realName),
				Email:        nullString(email),
				Phone:        nullString(phone),
				Avatar:       nullString(avatar),
				Role:         role,
				Department:   nullString(department),
				SkillTags:    nullString(skillTags),
				OnlineStatus: onlineStatus,
			},
		}

		httpx.OkJsonCtx(r.Context(), w, OK(resp))
	}
}

func generateJWTToken(secret string, expire int64, userId int64, username string, role int) string {
	claims := CustomClaims{
		UserId:   userId,
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(expire) * time.Second)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "smart-customer-service",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString([]byte(secret))
	return tokenString
}

func GetUserInfoHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId, _, _ := ParseUserFromContext(r)

		var user types.UserInfo
		err := svcCtx.DB.QueryRow(`
			SELECT id, username, real_name, email, phone, avatar, role, department, skill_tags, online_status
			FROM user WHERE id = ? AND deleted_at IS NULL
		`, userId).Scan(&user.Id, &user.Username, &user.RealName, &user.Email, &user.Phone, &user.Avatar, &user.Role, &user.Department, &user.SkillTags, &user.OnlineStatus)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("用户不存在"))
			return
		}

		httpx.OkJsonCtx(r.Context(), w, OK(user))
	}
}

func GetUserListHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		page, _ := strconv.Atoi(r.URL.Query().Get("page"))
		pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
		role, _ := strconv.Atoi(r.URL.Query().Get("role"))
		status, _ := strconv.Atoi(r.URL.Query().Get("status"))
		keyword := r.URL.Query().Get("keyword")

		if page <= 0 {
			page = 1
		}
		if pageSize <= 0 {
			pageSize = 10
		}

		var where = " WHERE deleted_at IS NULL"
		var args []interface{}

		if role > 0 {
			where += " AND role = ?"
			args = append(args, role)
		}
		if status > 0 {
			where += " AND status = ?"
			args = append(args, status)
		}
		if keyword != "" {
			where += " AND (username LIKE ? OR real_name LIKE ? OR email LIKE ?)"
			args = append(args, "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
		}

		var total int64
		svcCtx.DB.QueryRow("SELECT COUNT(*) FROM user"+where, args...).Scan(&total)

		offset := (page - 1) * pageSize
		rows, err := svcCtx.DB.Query(`
			SELECT id, username, real_name, email, phone, avatar, role, department, skill_tags, online_status, status, created_at
			FROM user`+where+` ORDER BY id DESC LIMIT ? OFFSET ?`, append(args, pageSize, offset)...)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("查询失败"))
			return
		}
		defer rows.Close()

		var list []types.UserInfo
		for rows.Next() {
			var u types.UserInfo
			var department, skillTags sql.NullString
			rows.Scan(&u.Id, &u.Username, &u.RealName, &u.Email, &u.Phone, &u.Avatar, &u.Role, &department, &skillTags, &u.OnlineStatus, &u.Status, &u.CreatedAt)
			u.Department = nullString(department)
			u.SkillTags = nullString(skillTags)
			list = append(list, u)
		}

		httpx.OkJsonCtx(r.Context(), w, OK(types.UserListResp{Total: total, List: list}))
	}
}

func CreateUserHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.CreateUserReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("参数错误"))
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("密码加密失败"))
			return
		}

		now := time.Now()
		result, err := svcCtx.DB.Exec(`
			INSERT INTO user (username, password, real_name, email, phone, role, department, skill_tags, status, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
		`, req.Username, string(hashedPassword), req.RealName, req.Email, req.Phone, req.Role, req.Department, req.SkillTags, now, now)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("创建用户失败"))
			return
		}

		id, _ := result.LastInsertId()
		httpx.OkJsonCtx(r.Context(), w, OK(map[string]int64{"id": id}))
	}
}

func UpdateUserHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.UpdateUserReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("参数错误"))
			return
		}

		now := time.Now()
		_, err := svcCtx.DB.Exec(`
			UPDATE user SET real_name=?, email=?, phone=?, avatar=?, department=?, skill_tags=?, status=?, updated_at=? WHERE id=?
		`, req.RealName, req.Email, req.Phone, req.Avatar, req.Department, req.SkillTags, req.Status, now, req.Id)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("更新用户失败"))
			return
		}

		httpx.OkJsonCtx(r.Context(), w, OK(nil))
	}
}

func DeleteUserHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, _ := strconv.ParseInt(idStr, 10, 64)

		now := time.Now()
		_, err := svcCtx.DB.Exec(`UPDATE user SET deleted_at=?, status=0 WHERE id=?`, now, id)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("删除用户失败"))
			return
		}

		httpx.OkJsonCtx(r.Context(), w, OK(nil))
	}
}

func GetAgentListHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := svcCtx.DB.Query(`
			SELECT id, real_name, department, skill_tags, online_status, ticket_count, resolved_count
			FROM user WHERE role = 2 AND status = 1 AND deleted_at IS NULL ORDER BY id DESC
		`)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("查询失败"))
			return
		}
		defer rows.Close()

		var list []map[string]interface{}
		for rows.Next() {
			var id, onlineStatus, ticketCount, resolvedCount int64
			var realName, department, skillTags string
			rows.Scan(&id, &realName, &department, &skillTags, &onlineStatus, &ticketCount, &resolvedCount)
			list = append(list, map[string]interface{}{
				"id":           id,
				"name":         realName,
				"department":   department,
				"skillTags":    skillTags,
				"onlineStatus": onlineStatus,
				"ticketCount":  ticketCount,
				"resolvedCount": resolvedCount,
			})
		}

		httpx.OkJsonCtx(r.Context(), w, OK(list))
	}
}
