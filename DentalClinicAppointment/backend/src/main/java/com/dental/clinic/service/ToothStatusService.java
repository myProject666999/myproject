package com.dental.clinic.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.dental.clinic.entity.ToothStatus;
import com.dental.clinic.mapper.ToothStatusMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ToothStatusService {

    @Autowired
    private ToothStatusMapper toothStatusMapper;

    public List<ToothStatus> listByPatientId(Long patientId) {
        LambdaQueryWrapper<ToothStatus> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ToothStatus::getPatientId, patientId)
               .orderByAsc(ToothStatus::getToothNumber);
        return toothStatusMapper.selectList(wrapper);
    }

    public boolean save(ToothStatus toothStatus) {
        toothStatus.setCreateTime(LocalDateTime.now());
        toothStatus.setUpdateTime(LocalDateTime.now());
        return toothStatusMapper.insert(toothStatus) > 0;
    }

    public boolean update(ToothStatus toothStatus) {
        toothStatus.setUpdateTime(LocalDateTime.now());
        return toothStatusMapper.updateById(toothStatus) > 0;
    }

    public boolean delete(Long id) {
        return toothStatusMapper.deleteById(id) > 0;
    }

    public ToothStatus getByPatientAndTooth(Long patientId, Integer toothNumber) {
        LambdaQueryWrapper<ToothStatus> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ToothStatus::getPatientId, patientId)
               .eq(ToothStatus::getToothNumber, toothNumber);
        return toothStatusMapper.selectOne(wrapper);
    }
}
