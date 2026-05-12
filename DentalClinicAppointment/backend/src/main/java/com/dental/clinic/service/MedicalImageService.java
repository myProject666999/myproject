package com.dental.clinic.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dental.clinic.entity.MedicalImage;
import com.dental.clinic.mapper.MedicalImageMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MedicalImageService {

    @Autowired
    private MedicalImageMapper medicalImageMapper;

    public Page<MedicalImage> page(Long current, Long size, Long patientId, String imageType) {
        Page<MedicalImage> page = new Page<>(current, size);
        LambdaQueryWrapper<MedicalImage> wrapper = new LambdaQueryWrapper<>();
        if (patientId != null) {
            wrapper.eq(MedicalImage::getPatientId, patientId);
        }
        if (imageType != null) {
            wrapper.eq(MedicalImage::getImageType, imageType);
        }
        wrapper.orderByDesc(MedicalImage::getTakeDate);
        return medicalImageMapper.selectPage(page, wrapper);
    }

    public MedicalImage getById(Long id) {
        return medicalImageMapper.selectById(id);
    }

    public boolean save(MedicalImage image) {
        image.setCreateTime(LocalDateTime.now());
        return medicalImageMapper.insert(image) > 0;
    }

    public boolean delete(Long id) {
        return medicalImageMapper.deleteById(id) > 0;
    }

    public List<MedicalImage> listByPatientId(Long patientId) {
        LambdaQueryWrapper<MedicalImage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MedicalImage::getPatientId, patientId)
               .orderByDesc(MedicalImage::getTakeDate);
        return medicalImageMapper.selectList(wrapper);
    }

    public List<MedicalImage> listByTreatmentRecordId(Long treatmentRecordId) {
        LambdaQueryWrapper<MedicalImage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MedicalImage::getTreatmentRecordId, treatmentRecordId)
               .orderByDesc(MedicalImage::getTakeDate);
        return medicalImageMapper.selectList(wrapper);
    }
}
