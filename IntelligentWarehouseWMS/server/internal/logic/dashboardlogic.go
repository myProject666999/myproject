package logic

import (
	"context"
	"time"

	"wms-server/internal/svc"
	"wms-server/internal/types"
	"wms-server/model"

	"github.com/zeromicro/go-zero/core/logx"
)

type DashboardLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewDashboardLogic(ctx context.Context, svcCtx *svc.ServiceContext) *DashboardLogic {
	return &DashboardLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *DashboardLogic) Dashboard() (*types.DashboardResp, error) {
	cacheKey := model.CacheKeyDashboard
	var cachedStats model.DashboardStats
	err := l.svcCtx.CacheManager.Get(l.ctx, cacheKey, &cachedStats)
	if err == nil && cachedStats.TotalProducts > 0 {
		return &types.DashboardResp{
			TotalWarehouse: cachedStats.TotalProducts / 10,
			TotalProduct:   cachedStats.TotalProducts,
			TotalInventory: cachedStats.TotalInventory,
			InboundCount:   cachedStats.TodayInbound,
			OutboundCount:  cachedStats.TodayOutbound,
			PendingTask:    cachedStats.InboundPending + cachedStats.OutboundPending,
		}, nil
	}

	warehouseQuery := &model.WarehouseQuery{}
	totalWarehouse, err := l.svcCtx.WarehouseModel.Count(warehouseQuery)
	if err != nil {
		return nil, err
	}

	productQuery := &model.ProductQuery{}
	totalProduct, err := l.svcCtx.ProductModel.Count(productQuery)
	if err != nil {
		return nil, err
	}

	totalInventory, err := l.svcCtx.InventoryModel.Count(0, 0, 0, "")
	if err != nil {
		return nil, err
	}

	today := time.Now().Format("2006-01-02")
	inboundCount, err := l.getTodayInboundCount(today)
	if err != nil {
		return nil, err
	}

	outboundCount, err := l.getTodayOutboundCount(today)
	if err != nil {
		return nil, err
	}

	pendingTask, err := l.getPendingTaskCount()
	if err != nil {
		return nil, err
	}

	stats := model.DashboardStats{
		TotalProducts:   totalProduct,
		TotalInventory:  totalInventory,
		TodayInbound:    inboundCount,
		TodayOutbound:   outboundCount,
		InboundPending:  pendingTask / 2,
		OutboundPending: pendingTask / 2,
		TurnoverRate:    0.85,
	}
	_ = l.svcCtx.CacheManager.Set(l.ctx, cacheKey, stats, model.CacheExpireShort)

	return &types.DashboardResp{
		TotalWarehouse: totalWarehouse,
		TotalProduct:   totalProduct,
		TotalInventory: totalInventory,
		InboundCount:   inboundCount,
		OutboundCount:  outboundCount,
		PendingTask:    pendingTask,
	}, nil
}

func (l *DashboardLogic) getTodayInboundCount(today string) (int64, error) {
	inboundOrders, err := l.svcCtx.InboundOrderModel.FindList(1, 1000, 0, 0, 0, "", "")
	if err != nil {
		return 0, err
	}

	var count int64
	for _, order := range inboundOrders {
		orderDate := order.CreateTime.Format("2006-01-02")
		if orderDate == today {
			count += order.InboundQty
		}
	}
	return count, nil
}

func (l *DashboardLogic) getTodayOutboundCount(today string) (int64, error) {
	outboundOrders, err := l.svcCtx.OutboundOrderModel.FindList(1, 1000, 0, 0, 0, "", "")
	if err != nil {
		return 0, err
	}

	var count int64
	for _, order := range outboundOrders {
		orderDate := order.CreateTime.Format("2006-01-02")
		if orderDate == today {
			count += order.OutboundQty
		}
	}
	return count, nil
}

func (l *DashboardLogic) getPendingTaskCount() (int64, error) {
	status := int64(1)
	pickingQuery := &model.PickingTaskQuery{
		Status: &status,
	}
	pickingCount, err := l.svcCtx.PickingTaskModel.Count(pickingQuery)
	if err != nil {
		return 0, err
	}

	putawayQuery := &model.PutawayTaskQuery{
		Status: &status,
	}
	putawayCount, err := l.svcCtx.PutawayTaskModel.Count(putawayQuery)
	if err != nil {
		return 0, err
	}

	stocktakeQuery := &model.StocktakeTaskQuery{
		Status: &status,
	}
	stocktakeCount, err := l.svcCtx.StocktakeTaskModel.Count(stocktakeQuery)
	if err != nil {
		return 0, err
	}

	return pickingCount + putawayCount + stocktakeCount, nil
}

type InventoryLogListLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewInventoryLogListLogic(ctx context.Context, svcCtx *svc.ServiceContext) *InventoryLogListLogic {
	return &InventoryLogListLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *InventoryLogListLogic) InventoryLogList(req *types.InventoryLogListReq) (*types.InventoryLogListResp, error) {
	page := int(req.Page)
	pageSize := int(req.PageSize)
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}

	list, err := l.svcCtx.InventoryLogModel.FindList(page, pageSize, req.WarehouseId, req.LocationId, req.ProductId, req.LogType, req.BusinessType, req.Sku, req.BusinessNo)
	if err != nil {
		return nil, err
	}

	total, err := l.svcCtx.InventoryLogModel.Count(req.WarehouseId, req.LocationId, req.ProductId, req.LogType, req.BusinessType, req.Sku, req.BusinessNo)
	if err != nil {
		return nil, err
	}

	var logList []types.InventoryLogInfo
	for _, item := range list {
		logList = append(logList, convertInventoryLogInfo(item))
	}

	return &types.InventoryLogListResp{
		Total: total,
		List:  logList,
	}, nil
}

func convertInventoryLogInfo(item *model.InventoryLog) types.InventoryLogInfo {
	return types.InventoryLogInfo{
		Id:           item.Id,
		LogNo:        item.LogNo,
		WarehouseId:  item.WarehouseId,
		LocationId:   item.LocationId,
		ProductId:    item.ProductId,
		Sku:          item.Sku,
		LogType:      item.LogType,
		BusinessType: item.BusinessType,
		BusinessNo:   item.BusinessNo,
		BeforeQty:    item.BeforeQty,
		ChangeQty:    item.ChangeQty,
		AfterQty:     item.AfterQty,
		Operator:     item.Operator,
		Remark:       item.Remark,
		CreateTime:   item.CreateTime.Format("2006-01-02 15:04:05"),
	}
}

type InOutReportLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewInOutReportLogic(ctx context.Context, svcCtx *svc.ServiceContext) *InOutReportLogic {
	return &InOutReportLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *InOutReportLogic) InOutReport(req *types.InOutReportReq) (*types.InOutReportResp, error) {
	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		return nil, err
	}
	endDate, err := time.Parse("2006-01-02", req.EndDate)
	if err != nil {
		return nil, err
	}

	var totalInbound, totalOutbound int64
	var list []types.InOutReportItem

	for d := startDate; !d.After(endDate); d = d.AddDate(0, 0, 1) {
		dateStr := d.Format("2006-01-02")
		inboundQty, err := l.getInboundQtyByDate(dateStr)
		if err != nil {
			return nil, err
		}
		outboundQty, err := l.getOutboundQtyByDate(dateStr)
		if err != nil {
			return nil, err
		}

		totalInbound += inboundQty
		totalOutbound += outboundQty

		list = append(list, types.InOutReportItem{
			Date:        dateStr,
			InboundQty:  inboundQty,
			OutboundQty: outboundQty,
		})
	}

	return &types.InOutReportResp{
		TotalInbound:  totalInbound,
		TotalOutbound: totalOutbound,
		List:          list,
	}, nil
}

func (l *InOutReportLogic) getInboundQtyByDate(dateStr string) (int64, error) {
	inboundOrders, err := l.svcCtx.InboundOrderModel.FindList(1, 1000, 0, 0, 0, "", "")
	if err != nil {
		return 0, err
	}

	var total int64
	for _, order := range inboundOrders {
		orderDate := order.CreateTime.Format("2006-01-02")
		if orderDate == dateStr {
			total += order.InboundQty
		}
	}
	return total, nil
}

func (l *InOutReportLogic) getOutboundQtyByDate(dateStr string) (int64, error) {
	outboundOrders, err := l.svcCtx.OutboundOrderModel.FindList(1, 1000, 0, 0, 0, "", "")
	if err != nil {
		return 0, err
	}

	var total int64
	for _, order := range outboundOrders {
		orderDate := order.CreateTime.Format("2006-01-02")
		if orderDate == dateStr {
			total += order.OutboundQty
		}
	}
	return total, nil
}
