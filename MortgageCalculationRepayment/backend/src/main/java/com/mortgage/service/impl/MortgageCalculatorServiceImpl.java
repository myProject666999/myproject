package com.mortgage.service.impl;

import com.mortgage.dto.LoanCalculateDTO;
import com.mortgage.dto.PrepaymentSimulateDTO;
import com.mortgage.enums.PrepaymentType;
import com.mortgage.enums.RepaymentType;
import com.mortgage.service.MortgageCalculatorService;
import com.mortgage.vo.LoanCalculateResultVO;
import com.mortgage.vo.PrepaymentResultVO;
import com.mortgage.vo.RepaymentPlanItemVO;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class MortgageCalculatorServiceImpl implements MortgageCalculatorService {

    private static final int SCALE = 2;
    private static final int CALC_SCALE = 10;
    private static final int MONTHS_PER_YEAR = 12;

    @Override
    public LoanCalculateResultVO calculate(LoanCalculateDTO dto) {
        RepaymentType type = RepaymentType.valueOf(dto.getRepaymentType());
        return switch (type) {
            case EQUAL_INSTALLMENT -> calculateEqualInstallment(dto);
            case EQUAL_PRINCIPAL -> calculateEqualPrincipal(dto);
        };
    }

    private LoanCalculateResultVO calculateEqualInstallment(LoanCalculateDTO dto) {
        BigDecimal loanAmount = dto.getLoanAmount();
        int months = dto.getLoanTermMonths();
        BigDecimal annualRate = dto.getAnnualInterestRate();
        BigDecimal monthlyRate = annualRate.divide(BigDecimal.valueOf(100), CALC_SCALE, RoundingMode.HALF_UP)
                .divide(BigDecimal.valueOf(MONTHS_PER_YEAR), CALC_SCALE, RoundingMode.HALF_UP);

        BigDecimal pow = monthlyRate.add(BigDecimal.ONE).pow(months);
        BigDecimal monthlyPayment = loanAmount.multiply(monthlyRate).multiply(pow)
                .divide(pow.subtract(BigDecimal.ONE), SCALE, RoundingMode.HALF_UP);

        List<RepaymentPlanItemVO> plan = new ArrayList<>();
        BigDecimal remainingPrincipal = loanAmount;
        BigDecimal totalInterest = BigDecimal.ZERO;
        LocalDate repaymentDate = LocalDate.now().plusMonths(1);

        for (int i = 1; i <= months; i++) {
            BigDecimal interest = remainingPrincipal.multiply(monthlyRate).setScale(SCALE, RoundingMode.HALF_UP);
            BigDecimal principal = monthlyPayment.subtract(interest);

            if (i == months) {
                principal = remainingPrincipal;
                monthlyPayment = principal.add(interest);
            }

            remainingPrincipal = remainingPrincipal.subtract(principal);
            totalInterest = totalInterest.add(interest);

            RepaymentPlanItemVO item = new RepaymentPlanItemVO();
            item.setPeriod(i);
            item.setRepaymentDate(repaymentDate);
            item.setMonthlyPayment(monthlyPayment);
            item.setPrincipal(principal);
            item.setInterest(interest);
            item.setRemainingPrincipal(remainingPrincipal.max(BigDecimal.ZERO));
            plan.add(item);

            repaymentDate = repaymentDate.plusMonths(1);
        }

        LoanCalculateResultVO result = new LoanCalculateResultVO();
        result.setLoanAmount(loanAmount);
        result.setLoanTermMonths(months);
        result.setAnnualInterestRate(annualRate);
        result.setRepaymentType(dto.getRepaymentType());
        result.setRepaymentTypeName(RepaymentType.EQUAL_INSTALLMENT.getDesc());
        result.setTotalPayment(loanAmount.add(totalInterest));
        result.setTotalInterest(totalInterest);
        result.setFirstMonthPayment(monthlyPayment);
        result.setLastMonthPayment(plan.get(plan.size() - 1).getMonthlyPayment());
        result.setRepaymentPlan(plan);

        return result;
    }

    private LoanCalculateResultVO calculateEqualPrincipal(LoanCalculateDTO dto) {
        BigDecimal loanAmount = dto.getLoanAmount();
        int months = dto.getLoanTermMonths();
        BigDecimal annualRate = dto.getAnnualInterestRate();
        BigDecimal monthlyRate = annualRate.divide(BigDecimal.valueOf(100), CALC_SCALE, RoundingMode.HALF_UP)
                .divide(BigDecimal.valueOf(MONTHS_PER_YEAR), CALC_SCALE, RoundingMode.HALF_UP);

        BigDecimal monthlyPrincipal = loanAmount.divide(BigDecimal.valueOf(months), SCALE, RoundingMode.HALF_UP);

        List<RepaymentPlanItemVO> plan = new ArrayList<>();
        BigDecimal remainingPrincipal = loanAmount;
        BigDecimal totalInterest = BigDecimal.ZERO;
        LocalDate repaymentDate = LocalDate.now().plusMonths(1);
        BigDecimal firstMonthPayment = null;
        BigDecimal lastMonthPayment = null;

        for (int i = 1; i <= months; i++) {
            BigDecimal interest = remainingPrincipal.multiply(monthlyRate).setScale(SCALE, RoundingMode.HALF_UP);

            BigDecimal currentPrincipal = monthlyPrincipal;
            if (i == months) {
                currentPrincipal = remainingPrincipal;
            }

            BigDecimal monthlyPayment = currentPrincipal.add(interest);
            remainingPrincipal = remainingPrincipal.subtract(currentPrincipal);
            totalInterest = totalInterest.add(interest);

            RepaymentPlanItemVO item = new RepaymentPlanItemVO();
            item.setPeriod(i);
            item.setRepaymentDate(repaymentDate);
            item.setMonthlyPayment(monthlyPayment);
            item.setPrincipal(currentPrincipal);
            item.setInterest(interest);
            item.setRemainingPrincipal(remainingPrincipal.max(BigDecimal.ZERO));
            plan.add(item);

            if (i == 1) {
                firstMonthPayment = monthlyPayment;
            }
            if (i == months) {
                lastMonthPayment = monthlyPayment;
            }

            repaymentDate = repaymentDate.plusMonths(1);
        }

        LoanCalculateResultVO result = new LoanCalculateResultVO();
        result.setLoanAmount(loanAmount);
        result.setLoanTermMonths(months);
        result.setAnnualInterestRate(annualRate);
        result.setRepaymentType(dto.getRepaymentType());
        result.setRepaymentTypeName(RepaymentType.EQUAL_PRINCIPAL.getDesc());
        result.setTotalPayment(loanAmount.add(totalInterest));
        result.setTotalInterest(totalInterest);
        result.setFirstMonthPayment(firstMonthPayment);
        result.setLastMonthPayment(lastMonthPayment);
        result.setRepaymentPlan(plan);

        return result;
    }

    @Override
    public PrepaymentResultVO simulatePrepayment(PrepaymentSimulateDTO dto) {
        RepaymentType repaymentType = RepaymentType.valueOf(dto.getRepaymentType());
        PrepaymentType prepaymentType = PrepaymentType.valueOf(dto.getPrepaymentType());

        BigDecimal loanAmount = dto.getLoanAmount();
        int totalMonths = dto.getLoanTermMonths();
        int paidPeriods = dto.getPaidPeriods();
        BigDecimal prepaymentAmount = dto.getPrepaymentAmount();
        BigDecimal annualRate = dto.getAnnualInterestRate();
        BigDecimal monthlyRate = annualRate.divide(BigDecimal.valueOf(100), CALC_SCALE, RoundingMode.HALF_UP)
                .divide(BigDecimal.valueOf(MONTHS_PER_YEAR), CALC_SCALE, RoundingMode.HALF_UP);

        BigDecimal remainingPrincipal = calculateRemainingPrincipal(loanAmount, totalMonths, monthlyRate, paidPeriods, repaymentType);

        BigDecimal oldTotalInterest = calculateTotalInterest(loanAmount, totalMonths, monthlyRate, repaymentType);
        BigDecimal oldPaidInterest = calculatePaidInterest(loanAmount, totalMonths, monthlyRate, paidPeriods, repaymentType);
        BigDecimal oldRemainingInterest = oldTotalInterest.subtract(oldPaidInterest);

        BigDecimal newRemainingPrincipal = remainingPrincipal.subtract(prepaymentAmount);

        PrepaymentResultVO result = new PrepaymentResultVO();
        result.setPrepaymentAmount(prepaymentAmount);
        result.setPrepaymentType(dto.getPrepaymentType());
        result.setPrepaymentTypeName(prepaymentType.getDesc());
        result.setRemainingPrincipalBefore(remainingPrincipal);
        result.setRemainingPrincipalAfter(newRemainingPrincipal);
        result.setOldTermMonths(totalMonths - paidPeriods);

        if (repaymentType == RepaymentType.EQUAL_INSTALLMENT) {
            BigDecimal oldMonthlyPayment = calculateMonthlyPayment(loanAmount, totalMonths, monthlyRate);
            result.setOldMonthlyPayment(oldMonthlyPayment);

            if (prepaymentType == PrepaymentType.SHORTEN_TERM) {
                int newRemainingMonths = calculateMonthsForEqualInstallment(newRemainingPrincipal, oldMonthlyPayment, monthlyRate);
                BigDecimal newTotalInterest = oldPaidInterest.add(calculateTotalInterestEqualInstallment(newRemainingPrincipal, oldMonthlyPayment, monthlyRate, newRemainingMonths));
                result.setNewTermMonths(newRemainingMonths);
                result.setNewMonthlyPayment(oldMonthlyPayment);
                result.setSavedInterest(oldTotalInterest.subtract(newTotalInterest));
            } else {
                int remainingMonths = totalMonths - paidPeriods;
                BigDecimal newMonthlyPayment = calculateMonthlyPayment(newRemainingPrincipal, remainingMonths, monthlyRate);
                BigDecimal newTotalInterest = oldPaidInterest.add(newMonthlyPayment.multiply(BigDecimal.valueOf(remainingMonths)).subtract(newRemainingPrincipal));
                result.setNewTermMonths(remainingMonths);
                result.setNewMonthlyPayment(newMonthlyPayment);
                result.setSavedInterest(oldTotalInterest.subtract(newTotalInterest));
            }
        } else {
            BigDecimal oldMonthlyPayment = calculateFirstMonthPaymentEqualPrincipal(loanAmount, totalMonths, monthlyRate);
            result.setOldMonthlyPayment(oldMonthlyPayment);

            if (prepaymentType == PrepaymentType.SHORTEN_TERM) {
                BigDecimal monthlyPrincipal = loanAmount.divide(BigDecimal.valueOf(totalMonths), SCALE, RoundingMode.HALF_UP);
                int newRemainingMonths = newRemainingPrincipal.divide(monthlyPrincipal, 0, RoundingMode.UP).intValue();
                BigDecimal newTotalInterest = calculateTotalInterestEqualPrincipal(newRemainingPrincipal, newRemainingMonths, monthlyRate).add(oldPaidInterest);
                result.setNewTermMonths(newRemainingMonths);
                result.setNewMonthlyPayment(calculateFirstMonthPaymentEqualPrincipal(newRemainingPrincipal, newRemainingMonths, monthlyRate));
                result.setSavedInterest(oldTotalInterest.subtract(newTotalInterest));
            } else {
                int remainingMonths = totalMonths - paidPeriods;
                BigDecimal newMonthlyPrincipal = newRemainingPrincipal.divide(BigDecimal.valueOf(remainingMonths), SCALE, RoundingMode.HALF_UP);
                BigDecimal newFirstMonthPayment = newMonthlyPrincipal.add(newRemainingPrincipal.multiply(monthlyRate).setScale(SCALE, RoundingMode.HALF_UP));
                BigDecimal newTotalInterest = calculateTotalInterestEqualPrincipal(newRemainingPrincipal, remainingMonths, monthlyRate).add(oldPaidInterest);
                result.setNewTermMonths(remainingMonths);
                result.setNewMonthlyPayment(newFirstMonthPayment);
                result.setSavedInterest(oldTotalInterest.subtract(newTotalInterest));
            }
        }

        return result;
    }

    private BigDecimal calculateRemainingPrincipal(BigDecimal loanAmount, int totalMonths, BigDecimal monthlyRate, int paidPeriods, RepaymentType type) {
        if (paidPeriods == 0) {
            return loanAmount;
        }

        if (type == RepaymentType.EQUAL_INSTALLMENT) {
            BigDecimal monthlyPayment = calculateMonthlyPayment(loanAmount, totalMonths, monthlyRate);
            BigDecimal remaining = loanAmount;
            for (int i = 0; i < paidPeriods; i++) {
                BigDecimal interest = remaining.multiply(monthlyRate).setScale(SCALE, RoundingMode.HALF_UP);
                BigDecimal principal = monthlyPayment.subtract(interest);
                remaining = remaining.subtract(principal);
            }
            return remaining;
        } else {
            BigDecimal monthlyPrincipal = loanAmount.divide(BigDecimal.valueOf(totalMonths), SCALE, RoundingMode.HALF_UP);
            return loanAmount.subtract(monthlyPrincipal.multiply(BigDecimal.valueOf(paidPeriods)));
        }
    }

    private BigDecimal calculateMonthlyPayment(BigDecimal loanAmount, int months, BigDecimal monthlyRate) {
        BigDecimal pow = monthlyRate.add(BigDecimal.ONE).pow(months);
        return loanAmount.multiply(monthlyRate).multiply(pow)
                .divide(pow.subtract(BigDecimal.ONE), SCALE, RoundingMode.HALF_UP);
    }

    private int calculateMonthsForEqualInstallment(BigDecimal principal, BigDecimal monthlyPayment, BigDecimal monthlyRate) {
        if (principal.compareTo(BigDecimal.ZERO) <= 0) return 0;
        int months = 0;
        BigDecimal remaining = principal;
        while (remaining.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal interest = remaining.multiply(monthlyRate).setScale(SCALE, RoundingMode.HALF_UP);
            BigDecimal principalPaid = monthlyPayment.subtract(interest);
            if (principalPaid.compareTo(remaining) >= 0) {
                months++;
                break;
            }
            remaining = remaining.subtract(principalPaid);
            months++;
        }
        return months;
    }

    private BigDecimal calculateTotalInterest(BigDecimal loanAmount, int months, BigDecimal monthlyRate, RepaymentType type) {
        if (type == RepaymentType.EQUAL_INSTALLMENT) {
            BigDecimal monthlyPayment = calculateMonthlyPayment(loanAmount, months, monthlyRate);
            return monthlyPayment.multiply(BigDecimal.valueOf(months)).subtract(loanAmount);
        } else {
            return calculateTotalInterestEqualPrincipal(loanAmount, months, monthlyRate);
        }
    }

    private BigDecimal calculateTotalInterestEqualPrincipal(BigDecimal loanAmount, int months, BigDecimal monthlyRate) {
        BigDecimal monthlyPrincipal = loanAmount.divide(BigDecimal.valueOf(months), SCALE, RoundingMode.HALF_UP);
        BigDecimal totalInterest = BigDecimal.ZERO;
        BigDecimal remaining = loanAmount;
        for (int i = 0; i < months; i++) {
            BigDecimal interest = remaining.multiply(monthlyRate).setScale(SCALE, RoundingMode.HALF_UP);
            totalInterest = totalInterest.add(interest);
            remaining = remaining.subtract(monthlyPrincipal);
        }
        return totalInterest;
    }

    private BigDecimal calculatePaidInterest(BigDecimal loanAmount, int totalMonths, BigDecimal monthlyRate, int paidPeriods, RepaymentType type) {
        if (paidPeriods == 0) return BigDecimal.ZERO;

        BigDecimal totalInterest = BigDecimal.ZERO;
        BigDecimal remaining = loanAmount;

        if (type == RepaymentType.EQUAL_INSTALLMENT) {
            BigDecimal monthlyPayment = calculateMonthlyPayment(loanAmount, totalMonths, monthlyRate);
            for (int i = 0; i < paidPeriods; i++) {
                BigDecimal interest = remaining.multiply(monthlyRate).setScale(SCALE, RoundingMode.HALF_UP);
                totalInterest = totalInterest.add(interest);
                BigDecimal principal = monthlyPayment.subtract(interest);
                remaining = remaining.subtract(principal);
            }
        } else {
            BigDecimal monthlyPrincipal = loanAmount.divide(BigDecimal.valueOf(totalMonths), SCALE, RoundingMode.HALF_UP);
            for (int i = 0; i < paidPeriods; i++) {
                BigDecimal interest = remaining.multiply(monthlyRate).setScale(SCALE, RoundingMode.HALF_UP);
                totalInterest = totalInterest.add(interest);
                remaining = remaining.subtract(monthlyPrincipal);
            }
        }
        return totalInterest;
    }

    private BigDecimal calculateFirstMonthPaymentEqualPrincipal(BigDecimal loanAmount, int months, BigDecimal monthlyRate) {
        BigDecimal monthlyPrincipal = loanAmount.divide(BigDecimal.valueOf(months), SCALE, RoundingMode.HALF_UP);
        BigDecimal firstMonthInterest = loanAmount.multiply(monthlyRate).setScale(SCALE, RoundingMode.HALF_UP);
        return monthlyPrincipal.add(firstMonthInterest);
    }

    private BigDecimal calculateTotalInterestEqualInstallment(BigDecimal principal, BigDecimal monthlyPayment, BigDecimal monthlyRate, int months) {
        BigDecimal totalInterest = BigDecimal.ZERO;
        BigDecimal remaining = principal;
        for (int i = 0; i < months; i++) {
            BigDecimal interest = remaining.multiply(monthlyRate).setScale(SCALE, RoundingMode.HALF_UP);
            totalInterest = totalInterest.add(interest);
            BigDecimal principalPaid = monthlyPayment.subtract(interest);
            remaining = remaining.subtract(principalPaid);
        }
        return totalInterest;
    }
}
