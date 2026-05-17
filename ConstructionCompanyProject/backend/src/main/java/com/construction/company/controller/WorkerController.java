package com.construction.company.controller;

import com.construction.company.common.Result;
import com.construction.company.entity.Worker;
import com.construction.company.service.WorkerService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "工人管理")
@RestController
@RequestMapping("/worker")
public class WorkerController {

    @Autowired
    private WorkerService workerService;

    @ApiOperation("查询工人列表")
    @GetMapping("/list")
    public Result<List<Worker>> list() {
        return Result.success(workerService.list());
    }

    @ApiOperation("根据ID查询工人")
    @GetMapping("/{id}")
    public Result<Worker> getById(@PathVariable Long id) {
        return Result.success(workerService.getById(id));
    }

    @ApiOperation("新增工人")
    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody Worker worker) {
        return Result.success(workerService.save(worker));
    }

    @ApiOperation("更新工人")
    @PutMapping("/update")
    public Result<Boolean> update(@RequestBody Worker worker) {
        return Result.success(workerService.updateById(worker));
    }

    @ApiOperation("删除工人")
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(workerService.removeById(id));
    }
}
