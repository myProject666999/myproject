package handler

import (
	"net/http"

	"smart-customer-service/internal/svc"
	"smart-customer-service/internal/types"
	"smart-customer-service/internal/socket"

	"github.com/zeromicro/go-zero/core/logx"
	"github.com/zeromicro/go-zero/rest"
)

func RegisterHandlers(server *rest.Server, serverCtx *svc.ServiceContext) {
	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodPost,
				Path:    "/api/login",
				Handler: LoginHandler(serverCtx),
			},
		},
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/api/user/info",
				Handler: GetUserInfoHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/api/user/list",
				Handler: GetUserListHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/user",
				Handler: CreateUserHandler(serverCtx),
			},
			{
				Method:  http.MethodPut,
				Path:    "/api/user",
				Handler: UpdateUserHandler(serverCtx),
			},
			{
				Method:  http.MethodDelete,
				Path:    "/api/user/:id",
				Handler: DeleteUserHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/api/user/agents",
				Handler: GetAgentListHandler(serverCtx),
			},
		},
		rest.WithJwt(serverCtx.Config.Auth.AccessSecret),
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/api/ticket/categories",
				Handler: GetTicketCategoriesHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/api/ticket/priorities",
				Handler: GetTicketPrioritiesHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/api/ticket/statuses",
				Handler: GetTicketStatusesHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/api/ticket/detail/:id",
				Handler: GetTicketDetailHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/api/ticket/list",
				Handler: GetTicketListHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/ticket",
				Handler: CreateTicketHandler(serverCtx),
			},
			{
				Method:  http.MethodPut,
				Path:    "/api/ticket",
				Handler: UpdateTicketHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/ticket/assign",
				Handler: AssignTicketHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/ticket/claim/:id",
				Handler: ClaimTicketHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/ticket/resolve/:id",
				Handler: ResolveTicketHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/ticket/close/:id",
				Handler: CloseTicketHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/ticket/reopen/:id",
				Handler: ReopenTicketHandler(serverCtx),
			},
		},
		rest.WithJwt(serverCtx.Config.Auth.AccessSecret),
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/api/ticket/messages/:ticketId",
				Handler: GetTicketMessagesHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/ticket/message",
				Handler: SendTicketMessageHandler(serverCtx),
			},
		},
		rest.WithJwt(serverCtx.Config.Auth.AccessSecret),
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/api/ticket/operation-logs/:ticketId",
				Handler: GetOperationLogsHandler(serverCtx),
			},
		},
		rest.WithJwt(serverCtx.Config.Auth.AccessSecret),
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/api/kb/categories",
				Handler: GetKbCategoriesHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/api/kb/articles",
				Handler: GetKbArticlesHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/api/kb/article/:id",
				Handler: GetKbArticleDetailHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/kb/article",
				Handler: CreateKbArticleHandler(serverCtx),
			},
			{
				Method:  http.MethodPut,
				Path:    "/api/kb/article",
				Handler: UpdateKbArticleHandler(serverCtx),
			},
			{
				Method:  http.MethodDelete,
				Path:    "/api/kb/article/:id",
				Handler: DeleteKbArticleHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/kb/search",
				Handler: SearchKbArticlesHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/kb/article/:id/helpful",
				Handler: MarkKbHelpfulHandler(serverCtx),
			},
		},
		rest.WithJwt(serverCtx.Config.Auth.AccessSecret),
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/api/stats/overview",
				Handler: GetStatsOverviewHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/api/stats/agent-workload",
				Handler: GetAgentWorkloadHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/api/stats/ticket-trend",
				Handler: GetTicketTrendHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/api/stats/category-stats",
				Handler: GetCategoryStatsHandler(serverCtx),
			},
		},
		rest.WithJwt(serverCtx.Config.Auth.AccessSecret),
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/ws/ticket/:ticketId",
				Handler: WebSocketHandler(serverCtx),
			},
		},
	)
}

func WebSocketHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ticketId := r.PathValue("ticketId")
		logx.Infof("WebSocket connection for ticket: %s", ticketId)
		socket.HandleWebSocket(svcCtx.Hub, w, r, ticketId)
	}
}

func ParseUserFromContext(r *http.Request) (int64, string, int) {
	userId, _ := r.Context().Value("userId").(int64)
	username, _ := r.Context().Value("username").(string)
	role, _ := r.Context().Value("role").(int)
	return userId, username, role
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	AccessToken string       `json:"accessToken"`
	ExpireAt    int64        `json:"expireAt"`
	UserInfo    types.UserInfo `json:"userInfo"`
}

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func OK(data interface{}) Response {
	return Response{
		Code:    0,
		Message: "success",
		Data:    data,
	}
}

func Fail(msg string) Response {
	return Response{
		Code:    -1,
		Message: msg,
	}
}

func FailWithCode(code int, msg string) Response {
	return Response{
		Code:    code,
		Message: msg,
	}
}
