package com.corporate.reimbursement.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.corporate.reimbursement.common.ReimbursementStatus;
import com.corporate.reimbursement.entity.Reimbursement;
import com.corporate.reimbursement.mapper.ReimbursementMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StatisticsServiceImpl implements StatisticsService {

    @Autowired
    private ReimbursementMapper reimbursementMapper;

    @Override
    public Map<String, Object> getPersonalStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();

        QueryWrapper<Reimbursement> allWrapper = new QueryWrapper<>();
        allWrapper.eq("applicant_id", userId);
        stats.put("totalCount", reimbursementMapper.selectCount(allWrapper));

        QueryWrapper<Reimbursement> draftWrapper = new QueryWrapper<>();
        draftWrapper.eq("applicant_id", userId)
                .eq("status", ReimbursementStatus.DRAFT.getCode());
        stats.put("draftCount", reimbursementMapper.selectCount(draftWrapper));

        QueryWrapper<Reimbursement> pendingWrapper = new QueryWrapper<>();
        pendingWrapper.eq("applicant_id", userId)
                .eq("status", ReimbursementStatus.PENDING.getCode());
        stats.put("pendingCount", reimbursementMapper.selectCount(pendingWrapper));

        QueryWrapper<Reimbursement> approvedWrapper = new QueryWrapper<>();
        approvedWrapper.eq("applicant_id", userId)
                .eq("status", ReimbursementStatus.APPROVED.getCode());
        stats.put("approvedCount", reimbursementMapper.selectCount(approvedWrapper));

        QueryWrapper<Reimbursement> rejectedWrapper = new QueryWrapper<>();
        rejectedWrapper.eq("applicant_id", userId)
                .eq("status", ReimbursementStatus.REJECTED.getCode());
        stats.put("rejectedCount", reimbursementMapper.selectCount(rejectedWrapper));

        return stats;
    }

    @Override
    public Map<String, Object> getDepartmentStats(Long deptId) {
        Map<String, Object> stats = new HashMap<>();

        QueryWrapper<Reimbursement> allWrapper = new QueryWrapper<>();
        allWrapper.eq("dept_id", deptId);
        stats.put("totalCount", reimbursementMapper.selectCount(allWrapper));

        QueryWrapper<Reimbursement> pendingWrapper = new QueryWrapper<>();
        pendingWrapper.eq("dept_id", deptId)
                .eq("status", ReimbursementStatus.PENDING.getCode());
        stats.put("pendingCount", reimbursementMapper.selectCount(pendingWrapper));

        QueryWrapper<Reimbursement> approvedWrapper = new QueryWrapper<>();
        approvedWrapper.eq("dept_id", deptId)
                .eq("status", ReimbursementStatus.APPROVED.getCode());
        stats.put("approvedCount", reimbursementMapper.selectCount(approvedWrapper));

        List<Reimbursement> approvedList = reimbursementMapper.selectList(approvedWrapper);
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (Reimbursement r : approvedList) {
            if (r.getTotalAmount() != null) {
                totalAmount = totalAmount.add(r.getTotalAmount());
            }
        }
        stats.put("approvedAmount", totalAmount);

        return stats;
    }

    @Override
    public List<Map<String, Object>> getMonthlyStats(int year) {
        List<Map<String, Object>> result = new ArrayList<>();

        for (int month = 1; month <= 12; month++) {
            Map<String, Object> monthStat = new HashMap<>();
            monthStat.put("month", month);

            QueryWrapper<Reimbursement> wrapper = new QueryWrapper<>();
            wrapper.apply("YEAR(create_time) = " + year)
                    .apply("MONTH(create_time) = " + month);
            List<Reimbursement> monthList = reimbursementMapper.selectList(wrapper);

            monthStat.put("count", (long) monthList.size());
            BigDecimal total = BigDecimal.ZERO;
            for (Reimbursement r : monthList) {
                if (r.getTotalAmount() != null) {
                    total = total.add(r.getTotalAmount());
                }
            }
            monthStat.put("totalAmount", total);
            result.add(monthStat);
        }

        return result;
    }
}