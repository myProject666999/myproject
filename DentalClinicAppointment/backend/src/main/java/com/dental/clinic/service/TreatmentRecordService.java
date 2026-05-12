package com.dental.clinic.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dental.clinic.entity.TreatmentRecord;
import com.dental.clinic.mapper.TreatmentRecordMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TreatmentRecordService {

    @Autowired
    private TreatmentRecordMapper treatmentRecordMapper;

    public Page<TreatmentRecord> page(Long current, Long size, Long patientId, Long doctorId, String paymentStatus) {
        Page<TreatmentRecord> page = new Page<>(current, size);
        LambdaQueryWrapper<TreatmentRecord> wrapper = new LambdaQueryWrapper<>();
        if (patientId != null) {
            wrapper.eq(TreatmentRecord::getPatientId, patientId);
        }
        if (doctorId != null) {
            wrapper.eq(TreatmentRecord::getDoctorId, doctorId);
        }
        if (paymentStatus != null) {
            wrapper.eq(TreatmentRecord::getPaymentStatus, paymentStatus);
        }
        wrapper.orderByDesc(TreatmentRecord::getCreateTime);
        return treatmentRecordMapper.selectPage(page, wrapper);
    }

    public TreatmentRecord getById(Long id) {
        return treatmentRecordMapper.selectById(id);
    }

    public boolean save(TreatmentRecord record) {
        record.setRecordNo("TR" + System.currentTimeMillis());
        record.setCreateTime(LocalDateTime.now());
        record.setUpdateTime(LocalDateTime.now());
        if (record.getPaidAmount() == null) {
            record.setPaidAmount(BigDecimal.ZERO);
        }
        if (record.getPaymentStatus() == null) {
            record.setPaymentStatus("UNPAID");
        }
        return treatmentRecordMapper.insert(record) > 0;
    }

    public boolean update(TreatmentRecord record) {
        record.setUpdateTime(LocalDateTime.now());
        return treatmentRecordMapper.updateById(record) > 0;
    }

    public boolean delete(Long id) {
        return treatmentRecordMapper.deleteById(id) > 0;
    }

    public List<TreatmentRecord> listByPatientId(Long patientId) {
        LambdaQueryWrapper<TreatmentRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TreatmentRecord::getPatientId, patientId)
               .orderByDesc(TreatmentRecord::getCreateTime);
        return treatmentRecordMapper.selectList(wrapper);
    }
}
