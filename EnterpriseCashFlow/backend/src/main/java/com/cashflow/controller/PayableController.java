package com.cashflow.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cashflow.common.Result;
import com.cashflow.entity.Payable;
import com.cashflow.service.PayableService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payables")
public class PayableController {

    private final PayableService payableService;

    public PayableController(PayableService payableService) {
        this.payableService = payableService;
    }

    @GetMapping("/page")
    public Result<IPage<Payable>> page(@RequestParam(defaultValue = "1") int current,
                                       @RequestParam(defaultValue = "10") int size,
                                       @RequestParam(required = false) String keyword,
                                       @RequestParam(required = false) Integer status) {
        return Result.success(payableService.pageList(current, size, keyword, status));
    }

    @GetMapping("/{id}")
    public Result<Payable> getById(@PathVariable Long id) {
        return Result.success(payableService.getById(id));
    }

    @GetMapping("/pending/{companyId}")
    public Result<Long> totalPending(@PathVariable Long companyId) {
        return Result.success(payableService.getTotalPending(companyId));
    }

    @PostMapping
    public Result<Payable> add(@RequestBody Payable payable) {
        return Result.success(payableService.addPayable(payable));
    }

    @PutMapping
    public Result<Payable> update(@RequestBody Payable payable) {
        return Result.success(payableService.updatePayable(payable));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        payableService.removeById(id);
        return Result.success();
    }
}
