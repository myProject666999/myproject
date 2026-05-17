package com.mortgage.controller;

import com.mortgage.common.Result;
import com.mortgage.dto.LoanCalculateDTO;
import com.mortgage.dto.PrepaymentSimulateDTO;
import com.mortgage.service.MortgageCalculatorService;
import com.mortgage.vo.LoanCalculateResultVO;
import com.mortgage.vo.PrepaymentResultVO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/calculator")
@CrossOrigin
public class MortgageCalculatorController {

    @Autowired
    private MortgageCalculatorService mortgageCalculatorService;

    @PostMapping("/calculate")
    public Result<LoanCalculateResultVO> calculate(@Valid @RequestBody LoanCalculateDTO dto) {
        return Result.success(mortgageCalculatorService.calculate(dto));
    }

    @PostMapping("/prepayment")
    public Result<PrepaymentResultVO> simulatePrepayment(@Valid @RequestBody PrepaymentSimulateDTO dto) {
        return Result.success(mortgageCalculatorService.simulatePrepayment(dto));
    }
}
