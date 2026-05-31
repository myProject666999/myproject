package com.smartdoor.controller;

import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.entity.CheckInRecord;
import com.smartdoor.service.CheckInRecordService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Api(tags = "入住记录管理")
@RestController
@RequestMapping("/check-in-record")
public class CheckInRecordController {

    @Autowired
    private CheckInRecordService checkInRecordService;

    @ApiOperation("分页查询记录列表")
    @GetMapping("/page")
    public Result<PageResult<CheckInRecord>> getRecordPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String recordNo,
            @RequestParam(required = false) Long contractId,
            @RequestParam(required = false) Long tenantId,
            @RequestParam(required = false) Long apartmentId,
            @RequestParam(required = false) String recordType) {
        return checkInRecordService.getRecordPage(pageNum, pageSize, recordNo, contractId, tenantId, apartmentId, recordType);
    }

    @ApiOperation("获取记录详情")
    @GetMapping("/{id}")
    public Result<CheckInRecord> getRecordDetail(@PathVariable Long id) {
        return checkInRecordService.getRecordDetail(id);
    }

    @ApiOperation("创建入住记录")
    @PostMapping
    public Result<Void> createRecord(@RequestBody CheckInRecord record) {
        return checkInRecordService.createRecord(record);
    }
}
