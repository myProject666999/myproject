package com.cashflow.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cashflow.common.Result;
import com.cashflow.entity.WarningRecord;
import com.cashflow.entity.WarningThreshold;
import com.cashflow.service.WarningService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/warnings")
@CrossOrigin
public class WarningController {

    private final WarningService warningService;

    public WarningController(WarningService warningService) {
        this.warningService = warningService;
    }

    @GetMapping("/thresholds")
    public Result<List<WarningThreshold>> thresholds() {
        return Result.success(warningService.getThresholds());
    }

    @PutMapping("/thresholds")
    public Result<WarningThreshold> updateThreshold(@RequestBody WarningThreshold threshold) {
        return Result.success(warningService.updateThreshold(threshold));
    }

    @GetMapping("/active")
    public Result<IPage<WarningRecord>> activeWarnings(@RequestParam(defaultValue = "1") int current,
                                                       @RequestParam(defaultValue = "10") int size) {
        return Result.success(warningService.getActiveWarnings(current, size));
    }

    @GetMapping("/history")
    public Result<IPage<WarningRecord>> historyWarnings(@RequestParam(defaultValue = "1") int current,
                                                        @RequestParam(defaultValue = "10") int size) {
        return Result.success(warningService.getHistoryWarnings(current, size));
    }

    @PostMapping("/{id}/resolve")
    public Result<Void> resolveWarning(@PathVariable Long id) {
        warningService.resolveWarning(id);
        return Result.success();
    }

    @PostMapping("/check")
    public Result<Void> checkWarnings() {
        warningService.checkAndGenerateWarnings();
        return Result.success();
    }
}
