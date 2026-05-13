package com.gym.membership.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gym.membership.entity.CoachPerformance;
import com.gym.membership.entity.CommissionRule;
import com.gym.membership.mapper.CoachPerformanceMapper;
import com.gym.membership.mapper.CommissionRuleMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class CoachPerformanceService extends ServiceImpl<CoachPerformanceMapper, CoachPerformance> {

    private final CommissionRuleMapper commissionRuleMapper;

    public CoachPerformanceService(CommissionRuleMapper commissionRuleMapper) {
        this.commissionRuleMapper = commissionRuleMapper;
    }

    public CoachPerformance getOrCreatePerformance(Long coachId, LocalDate date) {
        CoachPerformance performance = this.getOne(new LambdaQueryWrapper<CoachPerformance>()
                .eq(CoachPerformance::getCoachId, coachId)
                .eq(CoachPerformance::getPerformanceDate, date));

        if (performance == null) {
            performance = new CoachPerformance();
            performance.setCoachId(coachId);
            performance.setPerformanceDate(date);
            performance.setPrivateClasses(0);
            performance.setGroupClasses(0);
            performance.setSalesAmount(BigDecimal.ZERO);
            performance.setCommission(BigDecimal.ZERO);
            this.save(performance);
        }

        return performance;
    }

    @Transactional(rollbackFor = Exception.class)
    public void addGroupClassPerformance(Long coachId, LocalDate date) {
        CoachPerformance performance = getOrCreatePerformance(coachId, date);
        performance.setGroupClasses(performance.getGroupClasses() + 1);

        CommissionRule rule = commissionRuleMapper.selectOne(new LambdaQueryWrapper<CommissionRule>()
                .eq(CommissionRule::getRuleType, "GROUP")
                .eq(CommissionRule::getStatus, 1));

        if (rule != null && rule.getFixedAmount() != null) {
            performance.setCommission(performance.getCommission().add(rule.getFixedAmount()));
        }

        this.updateById(performance);
    }

    @Transactional(rollbackFor = Exception.class)
    public void addPrivateClassPerformance(Long coachId, LocalDate date, BigDecimal hours) {
        CoachPerformance performance = getOrCreatePerformance(coachId, date);
        performance.setPrivateClasses(performance.getPrivateClasses() + hours.intValue());

        CommissionRule rule = commissionRuleMapper.selectOne(new LambdaQueryWrapper<CommissionRule>()
                .eq(CommissionRule::getRuleType, "PRIVATE")
                .eq(CommissionRule::getStatus, 1));

        if (rule != null && rule.getFixedAmount() != null) {
            BigDecimal commission = rule.getFixedAmount().multiply(hours);
            performance.setCommission(performance.getCommission().add(commission));
        }

        this.updateById(performance);
    }

    @Transactional(rollbackFor = Exception.class)
    public void addSalesPerformance(Long coachId, BigDecimal amount) {
        LocalDate today = LocalDate.now();
        CoachPerformance performance = getOrCreatePerformance(coachId, today);
        performance.setSalesAmount(performance.getSalesAmount().add(amount));

        CommissionRule rule = commissionRuleMapper.selectOne(new LambdaQueryWrapper<CommissionRule>()
                .eq(CommissionRule::getRuleType, "SALES")
                .eq(CommissionRule::getStatus, 1));

        if (rule != null && rule.getCommissionRate() != null) {
            BigDecimal commission = amount.multiply(rule.getCommissionRate())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            performance.setCommission(performance.getCommission().add(commission));
        }

        this.updateById(performance);
    }

    public List<CoachPerformance> getPerformanceList(Long coachId, LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<CoachPerformance> wrapper = new LambdaQueryWrapper<>();
        if (coachId != null) {
            wrapper.eq(CoachPerformance::getCoachId, coachId);
        }
        if (startDate != null) {
            wrapper.ge(CoachPerformance::getPerformanceDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(CoachPerformance::getPerformanceDate, endDate);
        }
        wrapper.orderByDesc(CoachPerformance::getPerformanceDate);

        return this.list(wrapper);
    }

    public List<CommissionRule> getCommissionRules() {
        return commissionRuleMapper.selectList(new LambdaQueryWrapper<CommissionRule>()
                .eq(CommissionRule::getStatus, 1));
    }

    public void updateCommissionRule(CommissionRule rule) {
        commissionRuleMapper.updateById(rule);
    }
}
