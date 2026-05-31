package com.cashflow.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cashflow.common.Result;
import com.cashflow.entity.Payable;
import com.cashflow.service.PayableService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payables")
@CrossOrigin
public class PayableController {

    private final PayableService payableService;

    public PayableController(PayableService payableService) {
        this.payableService = payableService;
    }

    @GetMapping("/page")
    public Result<IPage<Payable>> page(@RequestParam(defaultValue = "1") int current,
                                       @RequestParam(defaultValue = "10") int size,
                                       @RequestParam(required = false) String keyword,
                                       @RequestParam(required = false) String status) {
        return Result.success(payableService.pageList(current, size, keyword, status));
    }

    @GetMapping("/statistics")
    public Result<Map<String, Object>> statistics() {
        return Result.success(payableService.getStatistics());
    }

    @GetMapping("/{id}")
    public Result<Payable> getById(@PathVariable Long id) {
        return Result.success(payableService.getById(id));
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
        payableService.deletePayable(id);
        return Result.success();
    }

    @PostMapping("/{id}/confirm")
    public Result<Void> confirmPayment(@PathVariable Long id,
                                       @RequestParam Long amount,
                                       @RequestParam Long accountId) {
        payableService.confirmPayment(id, amount, accountId);
        return Result.success();
    }
}
