package com.mortgage.controller;

import com.mortgage.common.Result;
import com.mortgage.entity.LoanScheme;
import com.mortgage.service.LoanSchemeService;
import com.mortgage.vo.LoanSchemeDetailVO;
import com.mortgage.vo.LoanSchemeStatisticsVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loan-schemes")
@CrossOrigin
public class LoanSchemeController {

    @Autowired
    private LoanSchemeService loanSchemeService;

    @GetMapping
    public Result<List<LoanScheme>> list() {
        return Result.success(loanSchemeService.list());
    }

    @GetMapping("/{id}")
    public Result<LoanScheme> getById(@PathVariable Long id) {
        return Result.success(loanSchemeService.getById(id));
    }

    @PostMapping
    public Result<LoanScheme> save(@RequestBody LoanScheme loanScheme) {
        return Result.success(loanSchemeService.save(loanScheme));
    }

    @PutMapping
    public Result<LoanScheme> update(@RequestBody LoanScheme loanScheme) {
        return Result.success(loanSchemeService.update(loanScheme));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        loanSchemeService.delete(id);
        return Result.success();
    }

    @GetMapping("/{id}/detail")
    public Result<LoanSchemeDetailVO> getDetail(@PathVariable Long id) {
        return Result.success(loanSchemeService.getDetail(id));
    }

    @GetMapping("/statistics")
    public Result<LoanSchemeStatisticsVO> getStatistics(@RequestParam(required = false) Long id) {
        return Result.success(loanSchemeService.getStatistics(id));
    }

    @PostMapping("/{id}/generate-plan")
    public Result<Void> generateRepaymentPlan(@PathVariable Long id) {
        loanSchemeService.generateRepaymentPlan(id);
        return Result.success();
    }
}
