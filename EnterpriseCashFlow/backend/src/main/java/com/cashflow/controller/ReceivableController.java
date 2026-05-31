package com.cashflow.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cashflow.common.Result;
import com.cashflow.entity.Receivable;
import com.cashflow.service.ReceivableService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/receivables")
@CrossOrigin
public class ReceivableController {

    private final ReceivableService receivableService;

    public ReceivableController(ReceivableService receivableService) {
        this.receivableService = receivableService;
    }

    @GetMapping("/page")
    public Result<IPage<Receivable>> page(@RequestParam(defaultValue = "1") int current,
                                          @RequestParam(defaultValue = "10") int size,
                                          @RequestParam(required = false) String keyword,
                                          @RequestParam(required = false) String status) {
        return Result.success(receivableService.pageList(current, size, keyword, status));
    }

    @GetMapping("/statistics")
    public Result<Map<String, Object>> statistics() {
        return Result.success(receivableService.getStatistics());
    }

    @GetMapping("/{id}")
    public Result<Receivable> getById(@PathVariable Long id) {
        return Result.success(receivableService.getById(id));
    }

    @PostMapping
    public Result<Receivable> add(@RequestBody Receivable receivable) {
        return Result.success(receivableService.addReceivable(receivable));
    }

    @PutMapping
    public Result<Receivable> update(@RequestBody Receivable receivable) {
        return Result.success(receivableService.updateReceivable(receivable));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        receivableService.deleteReceivable(id);
        return Result.success();
    }

    @PostMapping("/{id}/confirm")
    public Result<Void> confirmReceipt(@PathVariable Long id,
                                       @RequestParam Long amount,
                                       @RequestParam Long accountId) {
        receivableService.confirmReceipt(id, amount, accountId);
        return Result.success();
    }
}
