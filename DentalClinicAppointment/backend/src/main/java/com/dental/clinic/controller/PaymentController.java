package com.dental.clinic.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dental.clinic.common.PageResult;
import com.dental.clinic.common.Result;
import com.dental.clinic.entity.Payment;
import com.dental.clinic.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payments")
@CrossOrigin
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping
    public Result<PageResult<Payment>> list(
            @RequestParam(defaultValue = "1") Long current,
            @RequestParam(defaultValue = "10") Long size,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Long treatmentPlanId) {
        Page<Payment> page = paymentService.page(current, size, patientId, treatmentPlanId);
        return Result.success(PageResult.of(page.getTotal(), page.getRecords(), page.getCurrent(), page.getSize()));
    }

    @GetMapping("/patient/{patientId}")
    public Result<List<Payment>> listByPatientId(@PathVariable Long patientId) {
        List<Payment> payments = paymentService.listByPatientId(patientId);
        return Result.success(payments);
    }

    @GetMapping("/{id}")
    public Result<Payment> getById(@PathVariable Long id) {
        Payment payment = paymentService.getById(id);
        if (payment == null) {
            return Result.error("缴费记录不存在");
        }
        return Result.success(payment);
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody Payment payment) {
        boolean result = paymentService.save(payment);
        return result ? Result.success(true) : Result.error("保存失败");
    }
}
