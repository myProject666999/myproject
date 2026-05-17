package com.construction.company.controller;

import com.construction.company.common.Result;
import com.construction.company.entity.WorkOrder;
import com.construction.company.service.WorkOrderService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "工单管理")
@RestController
@RequestMapping("/workOrder")
public class WorkOrderController {

    @Autowired
    private WorkOrderService workOrderService;

    @ApiOperation("查询工单列表")
    @GetMapping("/list")
    public Result<List<WorkOrder>> list() {
        return Result.success(workOrderService.list());
    }

    @ApiOperation("根据ID查询工单")
    @GetMapping("/{id}")
    public Result<WorkOrder> getById(@PathVariable Long id) {
        return Result.success(workOrderService.getById(id));
    }

    @ApiOperation("新增工单")
    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody WorkOrder workOrder) {
        return Result.success(workOrderService.save(workOrder));
    }

    @ApiOperation("更新工单")
    @PutMapping("/update")
    public Result<Boolean> update(@RequestBody WorkOrder workOrder) {
        return Result.success(workOrderService.updateById(workOrder));
    }

    @ApiOperation("删除工单")
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(workOrderService.removeById(id));
    }
}
