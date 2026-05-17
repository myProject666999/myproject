package com.mortgage.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mortgage.entity.LoanScheme;
import com.mortgage.entity.RepaymentPlan;
import com.mortgage.enums.RepaymentType;
import com.mortgage.mapper.LoanSchemeMapper;
import com.mortgage.mapper.RepaymentPlanMapper;
import com.mortgage.service.LoanSchemeService;
import com.mortgage.vo.LoanSchemeDetailVO;
import com.mortgage.vo.LoanSchemeStatisticsVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class LoanSchemeServiceImpl implements LoanSchemeService {

    private static final int SCALE = 2;
    private static final int CALC_SCALE = 10;
    private static final int MONTHS_PER_YEAR = 12;

    @Autowired
    private LoanSchemeMapper loanSchemeMapper;

    @Autowired
    private RepaymentPlanMapper repaymentPlanMapper;

    @Override
    public List<LoanScheme> list() {
        return loanSchemeMapper.selectList(null);
    }

    @Override
    public LoanScheme getById(Long id) {
        return loanSchemeMapper.selectById(id);
    }

    @Override
    @Transactional
    public LoanScheme save(LoanScheme loanScheme) {
        loanScheme.setCreateTime(LocalDate.now().atStartOfDay());
        loanScheme.setUpdateTime(LocalDate.now().atStartOfDay());
        loanSchemeMapper.insert(loanScheme);
        generateRepaymentPlan(loanScheme.getId());
        return loanScheme;
    }

    @Override
    public LoanScheme update(LoanScheme loanScheme) {
        loanScheme.setUpdateTime(LocalDate.now().atStartOfDay());
        loanSchemeMapper.updateById(loanScheme);
        return loanScheme;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        repaymentPlanMapper.delete(new LambdaQueryWrapper<RepaymentPlan>().eq(RepaymentPlan::getLoanSchemeId, id));
        loanSchemeMapper.deleteById(id);
    }

    @Override
    public LoanSchemeDetailVO getDetail(Long id) {
        LoanScheme scheme = loanSchemeMapper.selectById(id);
        if (scheme == null) {
            return null;
        }

        List<RepaymentPlan> plans = repaymentPlanMapper.selectByLoanSchemeId(id);

        BigDecimal paidPrincipal = plans.stream()
                .filter(p -> p.getPaidPrincipal() != null)
                .map(RepaymentPlan::getPaidPrincipal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal paidInterest = plans.stream()
                .filter(p -> p.getPaidInterest() != null)
                .map(RepaymentPlan::getPaidInterest)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int paidPeriods = (int) plans.stream()
                .filter(p -> p.getPaidPrincipal() != null && p.getPaidPrincipal().compareTo(BigDecimal.ZERO) > 0)
                .count();

        BigDecimal remainingPrincipal = plans.stream()
                .reduce((first, second) -> second)
                .map(RepaymentPlan::getRemainingPrincipal)
                .orElse(scheme.getLoanAmount());

        BigDecimal totalInterest = plans.stream()
                .map(RepaymentPlan::getInterest)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remainingInterest = totalInterest.subtract(paidInterest);
        BigDecimal monthlyPayment = plans.isEmpty() ? BigDecimal.ZERO : plans.get(0).getMonthlyPayment();

        LoanSchemeDetailVO vo = new LoanSchemeDetailVO();
        vo.setId(scheme.getId());
        vo.setName(scheme.getName());
        vo.setLoanAmount(scheme.getLoanAmount());
        vo.setLoanTermMonths(scheme.getLoanTermMonths());
        vo.setAnnualInterestRate(scheme.getAnnualInterestRate());
        vo.setRepaymentType(scheme.getRepaymentType());
        vo.setRepaymentTypeName(RepaymentType.valueOf(scheme.getRepaymentType()).getDesc());
        vo.setTotalPayment(scheme.getLoanAmount().add(totalInterest));
        vo.setTotalInterest(totalInterest);
        vo.setMonthlyPayment(monthlyPayment);
        vo.setPaidPrincipal(paidPrincipal);
        vo.setPaidInterest(paidInterest);
        vo.setRemainingPrincipal(remainingPrincipal);
        vo.setRemainingInterest(remainingInterest);
        vo.setPaidPeriods(paidPeriods);
        vo.setRemainingPeriods(scheme.getLoanTermMonths() - paidPeriods);
        vo.setCreateTime(scheme.getCreateTime());

        return vo;
    }

    @Override
    public LoanSchemeStatisticsVO getStatistics(Long id) {
        List<LoanScheme> schemes = id != null ?
                List.of(loanSchemeMapper.selectById(id)) :
                loanSchemeMapper.selectList(null);

        LoanSchemeStatisticsVO vo = new LoanSchemeStatisticsVO();
        vo.setTotalLoanAmount(BigDecimal.ZERO);
        vo.setTotalPaidPrincipal(BigDecimal.ZERO);
        vo.setTotalPaidInterest(BigDecimal.ZERO);
        vo.setTotalRemainingPrincipal(BigDecimal.ZERO);
        vo.setTotalRemainingInterest(BigDecimal.ZERO);
        vo.setSchemeCount((long) schemes.size());

        for (LoanScheme scheme : schemes) {
            if (scheme == null) continue;
            LoanSchemeDetailVO detail = getDetail(scheme.getId());
            vo.setTotalLoanAmount(vo.getTotalLoanAmount().add(detail.getLoanAmount()));
            vo.setTotalPaidPrincipal(vo.getTotalPaidPrincipal().add(detail.getPaidPrincipal()));
            vo.setTotalPaidInterest(vo.getTotalPaidInterest().add(detail.getPaidInterest()));
            vo.setTotalRemainingPrincipal(vo.getTotalRemainingPrincipal().add(detail.getRemainingPrincipal()));
            vo.setTotalRemainingInterest(vo.getTotalRemainingInterest().add(detail.getRemainingInterest()));
        }

        return vo;
    }

    @Override
    @Transactional
    public void generateRepaymentPlan(Long schemeId) {
        LoanScheme scheme = loanSchemeMapper.selectById(schemeId);
        if (scheme == null) {
            return;
        }

        repaymentPlanMapper.delete(new LambdaQueryWrapper<RepaymentPlan>().eq(RepaymentPlan::getLoanSchemeId, schemeId));

        RepaymentType type = RepaymentType.valueOf(scheme.getRepaymentType());
        BigDecimal loanAmount = scheme.getLoanAmount();
        int months = scheme.getLoanTermMonths();
        BigDecimal monthlyRate = scheme.getAnnualInterestRate()
                .divide(BigDecimal.valueOf(100), CALC_SCALE, RoundingMode.HALF_UP)
                .divide(BigDecimal.valueOf(MONTHS_PER_YEAR), CALC_SCALE, RoundingMode.HALF_UP);

        LocalDate repaymentDate = LocalDate.now().plusMonths(1);

        if (type == RepaymentType.EQUAL_INSTALLMENT) {
            BigDecimal pow = monthlyRate.add(BigDecimal.ONE).pow(months);
            BigDecimal monthlyPayment = loanAmount.multiply(monthlyRate).multiply(pow)
                    .divide(pow.subtract(BigDecimal.ONE), SCALE, RoundingMode.HALF_UP);

            BigDecimal remainingPrincipal = loanAmount;

            for (int i = 1; i <= months; i++) {
                BigDecimal interest = remainingPrincipal.multiply(monthlyRate).setScale(SCALE, RoundingMode.HALF_UP);
                BigDecimal principal = monthlyPayment.subtract(interest);

                if (i == months) {
                    principal = remainingPrincipal;
                    monthlyPayment = principal.add(interest);
                }

                remainingPrincipal = remainingPrincipal.subtract(principal);

                RepaymentPlan plan = new RepaymentPlan();
                plan.setLoanSchemeId(schemeId);
                plan.setPeriod(i);
                plan.setRepaymentDate(repaymentDate);
                plan.setMonthlyPayment(monthlyPayment);
                plan.setPrincipal(principal);
                plan.setInterest(interest);
                plan.setRemainingPrincipal(remainingPrincipal.max(BigDecimal.ZERO));
                plan.setPaidPrincipal(BigDecimal.ZERO);
                plan.setPaidInterest(BigDecimal.ZERO);
                plan.setIsOverdue(0);
                plan.setCreateTime(LocalDate.now().atStartOfDay());

                repaymentPlanMapper.insert(plan);
                repaymentDate = repaymentDate.plusMonths(1);
            }
        } else {
            BigDecimal monthlyPrincipal = loanAmount.divide(BigDecimal.valueOf(months), SCALE, RoundingMode.HALF_UP);
            BigDecimal remainingPrincipal = loanAmount;

            for (int i = 1; i <= months; i++) {
                BigDecimal interest = remainingPrincipal.multiply(monthlyRate).setScale(SCALE, RoundingMode.HALF_UP);

                BigDecimal currentPrincipal = monthlyPrincipal;
                if (i == months) {
                    currentPrincipal = remainingPrincipal;
                }

                BigDecimal monthlyPayment = currentPrincipal.add(interest);
                remainingPrincipal = remainingPrincipal.subtract(currentPrincipal);

                RepaymentPlan plan = new RepaymentPlan();
                plan.setLoanSchemeId(schemeId);
                plan.setPeriod(i);
                plan.setRepaymentDate(repaymentDate);
                plan.setMonthlyPayment(monthlyPayment);
                plan.setPrincipal(currentPrincipal);
                plan.setInterest(interest);
                plan.setRemainingPrincipal(remainingPrincipal.max(BigDecimal.ZERO));
                plan.setPaidPrincipal(BigDecimal.ZERO);
                plan.setPaidInterest(BigDecimal.ZERO);
                plan.setIsOverdue(0);
                plan.setCreateTime(LocalDate.now().atStartOfDay());

                repaymentPlanMapper.insert(plan);
                repaymentDate = repaymentDate.plusMonths(1);
            }
        }
    }
}
