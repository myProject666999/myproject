package com.mortgage.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mortgage.common.Result;
import com.mortgage.entity.RepaymentPlan;
import com.mortgage.mapper.RepaymentPlanMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/repayment-plans")
@CrossOrigin
public class RepaymentPlanController {

    @Autowired
    private RepaymentPlanMapper repaymentPlanMapper;

    @GetMapping("/scheme/{schemeId}")
    public Result<List<RepaymentPlan>> getBySchemeId(@PathVariable Long schemeId) {
        return Result.success(repaymentPlanMapper.selectByLoanSchemeId(schemeId));
    }

    @PutMapping("/{id}/pay")
    public Result<Void> markAsPaid(@PathVariable Long id, @RequestBody RepaymentPlan plan) {
        RepaymentPlan existing = repaymentPlanMapper.selectById(id);
        if (existing != null) {
            existing.setPaidPrincipal(plan.getPrincipal());
            existing.setPaidInterest(plan.getInterest());
            repaymentPlanMapper.updateById(existing);
        }
        return Result.success();
    }
}
