package logic

import (
	"context"
	"time"

	"wms-server/internal/svc"
	"wms-server/internal/types"
	"wms-server/model"

	"github.com/zeromicro/go-zero/core/logx"
)

type StocktakeCreateLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewStocktakeCreateLogic(ctx context.Context, svcCtx *svc.ServiceContext) *StocktakeCreateLogic {
	return &StocktakeCreateLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *StocktakeCreateLogic) StocktakeCreate(req *types.StocktakeTaskCreateReq) (*types.CommonResp, error) {
	taskNo := req.TaskNo
	if taskNo == "" {
		taskNo = generateStocktakeTaskNo()
	}

	remark := req.Remark
	stocktakeTask := &model.StocktakeTask{
		TaskNo:      taskNo,
		WarehouseId: req.WarehouseId,
		TaskName:    req.TaskName,
		TaskType:    req.TaskType,
		TotalSku:    req.TotalSku,
		CheckedSku:  0,
		Status:      1,
		Operator:    req.Operator,
		Remark:      &remark,
		CreateTime:  time.Now(),
		UpdateTime:  time.Now(),
	}

	_, err := l.svcCtx.StocktakeTaskModel.Insert(stocktakeTask)
	if err != nil {
		return nil, err
	}

	return &types.CommonResp{
		Code:    0,
		Message: "success",
	}, nil
}

func generateStocktakeTaskNo() string {
	return "ST" + time.Now().Format("20060102150405")
}

type StocktakeListLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewStocktakeListLogic(ctx context.Context, svcCtx *svc.ServiceContext) *StocktakeListLogic {
	return &StocktakeListLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *StocktakeListLogic) StocktakeList(req *types.StocktakeTaskListReq) (*types.StocktakeTaskListResp, error) {
	page := int(req.Page)
	pageSize := int(req.PageSize)
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}

	query := &model.StocktakeTaskQuery{
		TaskNo:      req.TaskNo,
		TaskName:    req.TaskName,
		WarehouseId: req.WarehouseId,
		Operator:    req.Operator,
	}
	if req.TaskType > 0 {
		query.TaskType = &req.TaskType
	}
	if req.Status > 0 {
		query.Status = &req.Status
	}

	list, err := l.svcCtx.StocktakeTaskModel.FindList(page, pageSize, query)
	if err != nil {
		return nil, err
	}

	total, err := l.svcCtx.StocktakeTaskModel.Count(query)
	if err != nil {
		return nil, err
	}

	var taskList []types.StocktakeTaskInfo
	for _, item := range list {
		taskList = append(taskList, convertStocktakeTaskInfo(item))
	}

	return &types.StocktakeTaskListResp{
		Total: total,
		List:  taskList,
	}, nil
}

func convertStocktakeTaskInfo(item *model.StocktakeTask) types.StocktakeTaskInfo {
	var startTime, endTime string
	if item.StartTime != nil {
		startTime = item.StartTime.Format("2006-01-02 15:04:05")
	}
	if item.EndTime != nil {
		endTime = item.EndTime.Format("2006-01-02 15:04:05")
	}
	remark := ""
	if item.Remark != nil {
		remark = *item.Remark
	}

	return types.StocktakeTaskInfo{
		Id:          item.Id,
		TaskNo:      item.TaskNo,
		WarehouseId: item.WarehouseId,
		TaskName:    item.TaskName,
		TaskType:    item.TaskType,
		TotalSku:    item.TotalSku,
		CheckedSku:  item.CheckedSku,
		Status:      item.Status,
		Operator:    item.Operator,
		StartTime:   startTime,
		EndTime:     endTime,
		Remark:      remark,
		CreateTime:  item.CreateTime.Format("2006-01-02 15:04:05"),
	}
}

type StocktakeStartLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewStocktakeStartLogic(ctx context.Context, svcCtx *svc.ServiceContext) *StocktakeStartLogic {
	return &StocktakeStartLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *StocktakeStartLogic) StocktakeStart(req *types.StocktakeTaskStartReq) (*types.CommonResp, error) {
	task, err := l.svcCtx.StocktakeTaskModel.FindOne(req.Id)
	if err != nil {
		return nil, err
	}

	if task.Status != 1 {
		return &types.CommonResp{
			Code:    400,
			Message: "盘点任务状态不正确",
		}, nil
	}

	now := time.Now()
	task.Status = 2
	task.StartTime = &now
	task.Operator = req.Operator

	err = l.svcCtx.StocktakeTaskModel.Update(task)
	if err != nil {
		return nil, err
	}

	return &types.CommonResp{
		Code:    0,
		Message: "success",
	}, nil
}

type StocktakeCompleteLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewStocktakeCompleteLogic(ctx context.Context, svcCtx *svc.ServiceContext) *StocktakeCompleteLogic {
	return &StocktakeCompleteLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *StocktakeCompleteLogic) StocktakeComplete(req *types.StocktakeTaskCompleteReq) (*types.CommonResp, error) {
	task, err := l.svcCtx.StocktakeTaskModel.FindOne(req.Id)
	if err != nil {
		return nil, err
	}

	if task.Status != 2 {
		return &types.CommonResp{
			Code:    400,
			Message: "盘点任务状态不正确",
		}, nil
	}

	now := time.Now()
	task.Status = 3
	task.EndTime = &now
	task.CheckedSku = int64(len(req.Items))
	task.Operator = req.Operator

	err = l.svcCtx.StocktakeTaskModel.Update(task)
	if err != nil {
		return nil, err
	}

	for _, item := range req.Items {
		if item.DifferenceQty != 0 {
			inventory, err := l.svcCtx.InventoryModel.FindOne(item.InventoryId)
			if err == nil {
				newQty := inventory.Quantity + item.DifferenceQty
				newAvailableQty := inventory.AvailableQty + item.DifferenceQty
				if newQty < 0 {
					newQty = 0
				}
				if newAvailableQty < 0 {
					newAvailableQty = 0
				}

				err = l.svcCtx.InventoryModel.UpdateStock(inventory.Id, newQty, newAvailableQty, inventory.LockedQty, inventory.Version)
				if err != nil {
					return nil, err
				}

				logType := int64(1)
				if item.DifferenceQty < 0 {
					logType = 2
				}

				remarkLog := "盘点盈亏调整"
				inventoryLog := &model.InventoryLog{
					LogNo:        generateLogNo(),
					WarehouseId:  inventory.WarehouseId,
					LocationId:   inventory.LocationId,
					ProductId:    inventory.ProductId,
					Sku:          inventory.Sku,
					LogType:      logType,
					BusinessType: 4,
					BusinessNo:   task.TaskNo,
					BeforeQty:    inventory.Quantity,
					ChangeQty:    item.DifferenceQty,
					AfterQty:     newQty,
					Operator:     req.Operator,
					Remark:       &remarkLog,
					CreateTime:   now,
				}
				_, err = l.svcCtx.InventoryLogModel.Insert(inventoryLog)
				if err != nil {
					return nil, err
				}
			}
		}
	}

	return &types.CommonResp{
		Code:    0,
		Message: "success",
	}, nil
}
