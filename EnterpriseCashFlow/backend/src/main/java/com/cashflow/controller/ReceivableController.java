package com.cashflow.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cashflow.common.Result;
import com.cashflow.entity.Receivable;
import com.cashflow.service.ReceivableService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/receivables")
public class ReceivableController {

    private final ReceivableService receivableService;

    public ReceivableController(ReceivableService receivableService) {
        this.receivableService = receivableService;
    }

    @GetMapping("/page")
    public Result<IPage<Receivable>> page(@RequestParam(defaultValue = "1") int current,
                                          @RequestParam(defaultValue = "10") int size,
                                          @RequestParam(required = false) String keyword,
                                          @RequestParam(required = false) Integer status) {
        return Result.success(receivableService.pageList(current, size, keyword, status));
    }

    @GetMapping("/{id}")
    public Result<Receivable> getById(@PathVariable Long id) {
        return Result.success(receivableService.getById(id));
    }

    @GetMapping("/pending/{companyId}")
    public Result<Long> totalPending(@PathVariable Long companyId) {
        return Result.success(receivableService.getTotalPending(companyId));
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
        receivableService.removeById(id);
        return Result.success();
    }
}
