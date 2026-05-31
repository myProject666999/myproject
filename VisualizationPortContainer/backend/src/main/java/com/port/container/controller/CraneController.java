package com.port.container.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.port.container.aspect.OperationLog;
import com.port.container.common.PageResult;
import com.port.container.common.R;
import com.port.container.entity.Crane;
import com.port.container.service.CraneService;
import com.port.container.vo.CraneLoadInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/crane")
public class CraneController {

    @Autowired
    private CraneService craneService;

    @GetMapping("/list")
    public R<PageResult<Crane>> list(
            @RequestParam(required = false) Long current,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) String craneCode,
            @RequestParam(required = false) String craneName,
            @RequestParam(required = false) String craneType,
            @RequestParam(required = false) Long yardId,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        IPage<Crane> page = craneService.page(current != null ? current : 1L, size != null ? size : 10L);
        return R.success(PageResult.of(page));
    }

    @GetMapping("/{id}")
    public R<Crane> getById(@PathVariable Long id) {
        return R.success(craneService.getById(id));
    }

    @GetMapping("/available/{yardId}")
    public R<List<Crane>> getAvailableCranes(@PathVariable Long yardId) {
        return R.success(craneService.getAvailableCranes(yardId));
    }

    @GetMapping("/load-info")
    public R<List<CraneLoadInfoVO>> getLoadInfo() {
        return R.success(craneService.getCraneLoadInfo());
    }

    @PostMapping("/add")
    @OperationLog(module = "吊机管理", operationType = "新增", description = "新增吊机")
    public R<Void> add(@Valid @RequestBody Crane crane) {
        boolean result = craneService.save(crane);
        return result ? R.success() : R.fail();
    }

    @PutMapping("/update")
    @OperationLog(module = "吊机管理", operationType = "修改", description = "修改吊机")
    public R<Void> update(@Valid @RequestBody Crane crane) {
        boolean result = craneService.update(crane);
        return result ? R.success() : R.fail();
    }

    @PutMapping("/status/{craneId}/{status}")
    @OperationLog(module = "吊机管理", operationType = "更新状态", description = "更新吊机状态")
    public R<Void> updateStatus(@PathVariable Long craneId, @PathVariable Integer status, @RequestBody Map<String, Object> params) {
        Long operatorId = params.get("operatorId") != null ? Long.valueOf(params.get("operatorId").toString()) : null;
        String operatorName = params.get("operatorName") != null ? params.get("operatorName").toString() : null;
        boolean result = craneService.updateCraneStatus(craneId, status, operatorId, operatorName);
        return result ? R.success() : R.fail();
    }

    @PutMapping("/position/{craneId}")
    @OperationLog(module = "吊机管理", operationType = "更新位置", description = "更新吊机位置")
    public R<Void> updatePosition(@PathVariable Long craneId, @RequestBody Map<String, Integer> params) {
        Integer currentRow = params.get("currentRow");
        Integer currentBay = params.get("currentBay");
        boolean result = craneService.updateCranePosition(craneId, currentRow, currentBay);
        return result ? R.success() : R.fail();
    }

    @DeleteMapping("/{id}")
    @OperationLog(module = "吊机管理", operationType = "删除", description = "删除吊机")
    public R<Void> delete(@PathVariable Long id) {
        boolean result = craneService.remove(id);
        return result ? R.success() : R.fail();
    }
}
