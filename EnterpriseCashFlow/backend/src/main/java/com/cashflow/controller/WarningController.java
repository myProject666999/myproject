package com.cashflow.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cashflow.common.Result;
import com.cashflow.entity.WarningRecord;
import com.cashflow.service.WarningService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/warnings")
public class WarningController {

    private final WarningService warningService;

    public WarningController(WarningService warningService) {
        this.warningService = warningService;
    }

    @GetMapping("/page")
    public Result<IPage<WarningRecord>> page(@RequestParam(defaultValue = "1") int current,
                                             @RequestParam(defaultValue = "10") int size,
                                             @RequestParam(required = false) String warningLevel,
                                             @RequestParam(required = false) Integer status) {
        return Result.success(warningService.pageList(current, size, warningLevel, status));
    }

    @GetMapping("/{id}")
    public Result<WarningRecord> getById(@PathVariable Long id) {
        return Result.success(warningService.getById(id));
    }

    @PostMapping("/check/{companyId}")
    public Result<Void> checkWarnings(@PathVariable Long companyId) {
        warningService.checkAndGenerateWarnings(companyId);
        return Result.success();
    }

    @PutMapping("/{id}/handle")
    public Result<Void> handleWarning(@PathVariable Long id, @RequestParam Integer status) {
        warningService.handleWarning(id, status);
        return Result.success();
    }
}
