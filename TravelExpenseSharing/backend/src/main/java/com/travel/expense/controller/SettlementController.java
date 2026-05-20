package com.travel.expense.controller;

import com.travel.expense.common.Result;
import com.travel.expense.dto.DebtMatrixDTO;
import com.travel.expense.dto.TransferPlanDTO;
import com.travel.expense.service.SettlementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settlement")
public class SettlementController {

    @Autowired
    private SettlementService settlementService;

    @GetMapping("/debt-matrix")
    public Result<DebtMatrixDTO> getDebtMatrix() {
        return Result.success(settlementService.getDebtMatrix());
    }

    @GetMapping("/transfer-plan")
    public Result<TransferPlanDTO> getTransferPlan() {
        return Result.success(settlementService.getTransferPlan());
    }

}
