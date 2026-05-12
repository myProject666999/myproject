package com.dental.clinic.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dental.clinic.entity.TreatmentPlan;
import com.dental.clinic.mapper.TreatmentPlanMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TreatmentPlanService {

    @Autowired
    private TreatmentPlanMapper treatmentPlanMapper;

    public Page<TreatmentPlan> page(Long current, Long size, Long patientId, Long doctorId, String status) {
        Page<TreatmentPlan> page = new Page<>(current, size);
        LambdaQueryWrapper<TreatmentPlan> wrapper = new LambdaQueryWrapper<>();
        if (patientId != null) {
            wrapper.eq(TreatmentPlan::getPatientId, patientId);
        }
        if (doctorId != null) {
            wrapper.eq(TreatmentPlan::getDoctorId, doctorId);
        }
        if (status != null) {
            wrapper.eq(TreatmentPlan::getStatus, status);
        }
        wrapper.orderByDesc(TreatmentPlan::getCreateTime);
        return treatmentPlanMapper.selectPage(page, wrapper);
    }

    public TreatmentPlan getById(Long id) {
        return treatmentPlanMapper.selectById(id);
    }

    public boolean save(TreatmentPlan plan) {
        plan.setPlanNo("TP" + System.currentTimeMillis());
        plan.setCreateTime(LocalDateTime.now());
        plan.setUpdateTime(LocalDateTime.now());
        if (plan.getPaidAmount() == null) {
            plan.setPaidAmount(BigDecimal.ZERO);
        }
        if (plan.getCurrentStage() == null) {
            plan.setCurrentStage(0);
        }
        if (plan.getStatus() == null) {
            plan.setStatus("IN_PROGRESS");
        }
        return treatmentPlanMapper.insert(plan) > 0;
    }

    public boolean update(TreatmentPlan plan) {
        plan.setUpdateTime(LocalDateTime.now());
        return treatmentPlanMapper.updateById(plan) > 0;
    }

    public boolean delete(Long id) {
        return treatmentPlanMapper.deleteById(id) > 0;
    }

    public List<TreatmentPlan> listByPatientId(Long patientId) {
        LambdaQueryWrapper<TreatmentPlan> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TreatmentPlan::getPatientId, patientId)
               .orderByDesc(TreatmentPlan::getCreateTime);
        return treatmentPlanMapper.selectList(wrapper);
    }

    public boolean updatePaidAmount(Long planId, BigDecimal amount) {
        TreatmentPlan plan = treatmentPlanMapper.selectById(planId);
        if (plan == null) return false;
        plan.setPaidAmount(plan.getPaidAmount().add(amount));
        plan.setUpdateTime(LocalDateTime.now());
        if (plan.getPaidAmount().compareTo(plan.getTotalAmount()) >= 0) {
            plan.setStatus("PAID");
        }
        return treatmentPlanMapper.updateById(plan) > 0;
    }
}
