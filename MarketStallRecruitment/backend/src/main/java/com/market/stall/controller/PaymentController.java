package com.market.stall.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.market.stall.common.PageResult;
import com.market.stall.common.Result;
import com.market.stall.dto.PaymentDTO;
import com.market.stall.dto.RefundDTO;
import com.market.stall.entity.Payment;
import com.market.stall.service.PaymentService;
import com.market.stall.vo.PaymentVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    private Long getCurrentUserId() {
        Object principal = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        if (principal instanceof Long) {
            return (Long) principal;
        }
        return Long.parseLong(principal.toString());
    }

    @PostMapping
    public Result<Payment> create(@RequestBody @Valid PaymentDTO dto) {
        return Result.success(paymentService.createPayment(dto, getCurrentUserId()));
    }

    @PostMapping("/confirm/{paymentNo}")
    public Result<Void> confirm(@PathVariable String paymentNo) {
        paymentService.confirmPayment(paymentNo);
        return Result.success();
    }

    @GetMapping("/page")
    public Result<PageResult<PaymentVO>> page(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long eventId,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Integer paymentType) {
        IPage<Payment> page = new Page<>(pageNum, pageSize);
        return Result.success(new PageResult<>(paymentService.pagePayments(page, eventId, status, paymentType)));
    }

    @PostMapping("/refund")
    public Result<Void> refund(@RequestBody @Valid RefundDTO dto) {
        paymentService.requestRefund(dto, getCurrentUserId());
        return Result.success();
    }

    @PostMapping("/refund/{paymentId}/process")
    public Result<Void> processRefund(@PathVariable Long paymentId, @RequestParam boolean approved) {
        paymentService.processRefund(paymentId, approved);
        return Result.success();
    }
}
