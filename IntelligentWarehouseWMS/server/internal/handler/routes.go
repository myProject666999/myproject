package handler

import (
	"net/http"

	"wms-server/internal/svc"

	"github.com/zeromicro/go-zero/rest"
)

func RegisterHandlers(server *rest.Server, serverCtx *svc.ServiceContext) {
	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodPost,
				Path:    "/api/auth/login",
				Handler: LoginHandler(serverCtx),
			},
		},
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/api/user/list",
				Handler: UserListHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/api/user/detail/:id",
				Handler: UserDetailHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/user/create",
				Handler: UserCreateHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/user/update",
				Handler: UserUpdateHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/user/delete",
				Handler: UserDeleteHandler(serverCtx),
			},
		},
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/api/warehouse/list",
				Handler: WarehouseListHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/api/warehouse/detail/:id",
				Handler: WarehouseDetailHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/warehouse/create",
				Handler: WarehouseCreateHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/warehouse/update",
				Handler: WarehouseUpdateHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/warehouse/delete",
				Handler: WarehouseDeleteHandler(serverCtx),
			},
		},
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/api/shelf/list",
				Handler: ShelfListHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/api/shelf/detail/:id",
				Handler: ShelfDetailHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/shelf/create",
				Handler: ShelfCreateHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/shelf/update",
				Handler: ShelfUpdateHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/shelf/delete",
				Handler: ShelfDeleteHandler(serverCtx),
			},
		},
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/api/location/list",
				Handler: LocationListHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/api/location/detail/:id",
				Handler: LocationDetailHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/location/create",
				Handler: LocationCreateHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/location/update",
				Handler: LocationUpdateHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/location/delete",
				Handler: LocationDeleteHandler(serverCtx),
			},
		},
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/api/product/list",
				Handler: ProductListHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/api/product/detail/:id",
				Handler: ProductDetailHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/product/create",
				Handler: ProductCreateHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/product/update",
				Handler: ProductUpdateHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/product/delete",
				Handler: ProductDeleteHandler(serverCtx),
			},
		},
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/api/inventory/list",
				Handler: InventoryListHandler(serverCtx),
			},
		},
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/api/inbound/list",
				Handler: InboundListHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/inbound/create",
				Handler: InboundCreateHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/inbound/audit",
				Handler: InboundAuditHandler(serverCtx),
			},
		},
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/api/outbound/list",
				Handler: OutboundListHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/outbound/create",
				Handler: OutboundCreateHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/outbound/audit",
				Handler: OutboundAuditHandler(serverCtx),
			},
		},
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/api/picking/list",
				Handler: PickingListHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/picking/complete",
				Handler: PickingCompleteHandler(serverCtx),
			},
		},
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/api/stocktake/list",
				Handler: StocktakeListHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/stocktake/create",
				Handler: StocktakeCreateHandler(serverCtx),
			},
			{
				Method:  http.MethodPost,
				Path:    "/api/stocktake/complete",
				Handler: StocktakeCompleteHandler(serverCtx),
			},
		},
	)

	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/api/report/dashboard",
				Handler: DashboardHandler(serverCtx),
			},
			{
				Method:  http.MethodGet,
				Path:    "/api/report/inventorylog",
				Handler: InventoryLogListHandler(serverCtx),
			},
		},
	)
}
