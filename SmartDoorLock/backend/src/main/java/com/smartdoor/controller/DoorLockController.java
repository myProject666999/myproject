package com.smartdoor.controller;

import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.entity.DoorLock;
import com.smartdoor.service.DoorLockService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "门锁管理")
@RestController
@RequestMapping("/door-lock")
public class DoorLockController {

    @Autowired
    private DoorLockService doorLockService;

    @ApiOperation("分页查询门锁列表")
    @GetMapping("/page")
    public Result<PageResult<DoorLock>> getLockPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String lockNo,
            @RequestParam(required = false) String apartmentId,
            @RequestParam(required = false) String networkStatus,
            @RequestParam(required = false) String lockStatus) {
        return doorLockService.getLockPage(pageNum, pageSize, lockNo, apartmentId, networkStatus, lockStatus);
    }

    @ApiOperation("获取门锁详情")
    @GetMapping("/{id}")
    public Result<DoorLock> getLockDetail(@PathVariable Long id) {
        return doorLockService.getLockDetail(id);
    }

    @ApiOperation("获取所有门锁列表")
    @GetMapping("/list")
    public Result<List<DoorLock>> getLockList() {
        return Result.success(doorLockService.list());
    }

    @ApiOperation("新增门锁")
    @PostMapping
    public Result<Void> addLock(@RequestBody DoorLock doorLock) {
        return doorLockService.addLock(doorLock);
    }

    @ApiOperation("更新门锁")
    @PutMapping
    public Result<Void> updateLock(@RequestBody DoorLock doorLock) {
        return doorLockService.updateLock(doorLock);
    }

    @ApiOperation("删除门锁")
    @DeleteMapping("/{id}")
    public Result<Void> deleteLock(@PathVariable Long id) {
        return doorLockService.deleteLock(id);
    }

    @ApiOperation("更新门锁状态")
    @PutMapping("/{id}/status")
    public Result<Void> updateLockStatus(
            @PathVariable Long id,
            @RequestParam(required = false) String networkStatus,
            @RequestParam(required = false) String lockStatus) {
        return doorLockService.updateLockStatus(id, networkStatus, lockStatus);
    }
}
