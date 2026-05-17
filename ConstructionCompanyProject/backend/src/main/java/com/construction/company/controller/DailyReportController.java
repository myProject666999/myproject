package com.construction.company.controller;

import com.construction.company.common.Result;
import com.construction.company.entity.DailyReport;
import com.construction.company.service.DailyReportService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "日报管理")
@RestController
@RequestMapping("/dailyReport")
public class DailyReportController {

    @Autowired
    private DailyReportService dailyReportService;

    @ApiOperation("查询日报列表")
    @GetMapping("/list")
    public Result<List<DailyReport>> list() {
        return Result.success(dailyReportService.list());
    }

    @ApiOperation("根据ID查询日报")
    @GetMapping("/{id}")
    public Result<DailyReport> getById(@PathVariable Long id) {
        return Result.success(dailyReportService.getById(id));
    }

    @ApiOperation("新增日报")
    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody DailyReport dailyReport) {
        return Result.success(dailyReportService.save(dailyReport));
    }

    @ApiOperation("更新日报")
    @PutMapping("/update")
    public Result<Boolean> update(@RequestBody DailyReport dailyReport) {
        return Result.success(dailyReportService.updateById(dailyReport));
    }

    @ApiOperation("删除日报")
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(dailyReportService.removeById(id));
    }
}
