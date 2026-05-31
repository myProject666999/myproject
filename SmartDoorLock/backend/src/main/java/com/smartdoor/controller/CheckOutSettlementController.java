package com.smartdoor.controller;

import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.dto.CheckOutSettlementDTO;
import com.smartdoor.entity.CheckOutSettlement;
import com.smartdoor.service.CheckOutSettlementService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Api(tags = "退租结算管理")
@RestController
@RequestMapping("/check-out-settlement")
public class CheckOutSettlementController {

    @Autowired
    private CheckOutSettlementService checkOutSettlementService;

    @ApiOperation("分页查询结算列表")
    @GetMapping("/page")
    public Result<PageResult<CheckOutSettlement>> getSettlementPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String settlementNo,
            @RequestParam(required = false) Long contractId,
            @RequestParam(required = false) Long tenantId,
            @RequestParam(required = false) Long apartmentId,
            @RequestParam(required = false) String status) {
        return checkOutSettlementService.getSettlementPage(pageNum, pageSize, settlementNo, contractId, tenantId, apartmentId, status);
    }

    @ApiOperation("获取结算详情")
    @GetMapping("/{id}")
    public Result<CheckOutSettlement> getSettlementDetail(@PathVariable Long id) {
        return checkOutSettlementService.getSettlementDetail(id);
    }

    @ApiOperation("创建退租结算")
    @PostMapping
    public Result<CheckOutSettlement> createSettlement(@RequestBody CheckOutSettlementDTO dto) {
        return checkOutSettlementService.createSettlement(dto);
    }

    @ApiOperation("确认结算")
    @PutMapping("/{id}/confirm")
    public Result<Void> confirmSettlement(@PathVariable Long id) {
        return checkOutSettlementService.confirmSettlement(id);
    }

    @ApiOperation("执行退款")
    @PutMapping("/{id}/refund")
    public Result<Void> executeRefund(
            @PathVariable Long id,
            @RequestParam String refundMethod,
            @RequestParam(required = false) String refundTransactionNo) {
        return checkOutSettlementService.executeRefund(id, refundMethod, refundTransactionNo);
    }
}
