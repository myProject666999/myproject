package com.dental.clinic.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dental.clinic.entity.Payment;
import com.dental.clinic.mapper.PaymentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentMapper paymentMapper;

    @Autowired
    private TreatmentPlanService treatmentPlanService;

    public Page<Payment> page(Long current, Long size, Long patientId, Long treatmentPlanId) {
        Page<Payment> page = new Page<>(current, size);
        LambdaQueryWrapper<Payment> wrapper = new LambdaQueryWrapper<>();
        if (patientId != null) {
            wrapper.eq(Payment::getPatientId, patientId);
        }
        if (treatmentPlanId != null) {
            wrapper.eq(Payment::getTreatmentPlanId, treatmentPlanId);
        }
        wrapper.orderByDesc(Payment::getCreateTime);
        return paymentMapper.selectPage(page, wrapper);
    }

    public Payment getById(Long id) {
        return paymentMapper.selectById(id);
    }

    @Transactional
    public boolean save(Payment payment) {
        payment.setPaymentNo("PAY" + System.currentTimeMillis());
        payment.setCreateTime(LocalDateTime.now());
        int result = paymentMapper.insert(payment);
        if (result > 0 && payment.getTreatmentPlanId() != null) {
            treatmentPlanService.updatePaidAmount(payment.getTreatmentPlanId(), payment.getAmount());
        }
        return result > 0;
    }

    public List<Payment> listByPatientId(Long patientId) {
        LambdaQueryWrapper<Payment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Payment::getPatientId, patientId)
               .orderByDesc(Payment::getCreateTime);
        return paymentMapper.selectList(wrapper);
    }
}
