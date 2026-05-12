package com.tcm.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tcm.system.dto.ConflictCheckResult;
import com.tcm.system.dto.PrescriptionDTO;
import com.tcm.system.entity.Prescription;
import com.tcm.system.entity.PrescriptionHerb;
import com.tcm.system.repository.PrescriptionHerbRepository;
import com.tcm.system.repository.PrescriptionRepository;
import com.tcm.system.util.ConflictCheckUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private PrescriptionHerbRepository prescriptionHerbRepository;

    public ConflictCheckResult checkConflicts(List<Long> herbIds, List<String> herbNames) {
        if (herbNames != null && !herbNames.isEmpty()) {
            return ConflictCheckUtil.checkConflicts(herbNames);
        }
        return ConflictCheckUtil.checkConflicts(null);
    }

    public List<Prescription> listByPatient(Long patientId) {
        LambdaQueryWrapper<Prescription> wrapper = new LambdaQueryWrapper<>();
        if (patientId != null) {
            wrapper.eq(Prescription::getPatientId, patientId);
        }
        wrapper.orderByDesc(Prescription::getCreateTime);
        return prescriptionRepository.selectList(wrapper);
    }

    public PrescriptionDTO getDetail(Long id) {
        Prescription prescription = prescriptionRepository.selectById(id);
        if (prescription == null) return null;

        LambdaQueryWrapper<PrescriptionHerb> herbWrapper = new LambdaQueryWrapper<>();
        herbWrapper.eq(PrescriptionHerb::getPrescriptionId, id);
        herbWrapper.orderByAsc(PrescriptionHerb::getSortOrder);
        List<PrescriptionHerb> herbs = prescriptionHerbRepository.selectList(herbWrapper);

        PrescriptionDTO dto = new PrescriptionDTO();
        dto.setPrescription(prescription);
        dto.setHerbs(herbs);
        return dto;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean createPrescription(PrescriptionDTO dto) {
        Prescription prescription = dto.getPrescription();
        if (prescription.getPrescriptionNo() == null || prescription.getPrescriptionNo().isEmpty()) {
            String no = "CF" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) +
                    String.format("%04d", System.currentTimeMillis() % 10000);
            prescription.setPrescriptionNo(no);
        }
        if (prescription.getVisitDate() == null) {
            prescription.setVisitDate(LocalDate.now());
        }
        if (prescription.getStatus() == null) {
            prescription.setStatus(1);
        }

        prescriptionRepository.insert(prescription);

        List<PrescriptionHerb> herbs = dto.getHerbs();
        if (herbs != null && !herbs.isEmpty()) {
            for (int i = 0; i < herbs.size(); i++) {
                PrescriptionHerb herb = herbs.get(i);
                herb.setPrescriptionId(prescription.getId());
                herb.setSortOrder(i + 1);
                prescriptionHerbRepository.insert(herb);
            }
        }
        return true;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean updatePrescription(PrescriptionDTO dto) {
        Prescription prescription = dto.getPrescription();
        prescriptionRepository.updateById(prescription);

        LambdaQueryWrapper<PrescriptionHerb> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PrescriptionHerb::getPrescriptionId, prescription.getId());
        prescriptionHerbRepository.delete(wrapper);

        List<PrescriptionHerb> herbs = dto.getHerbs();
        if (herbs != null && !herbs.isEmpty()) {
            for (int i = 0; i < herbs.size(); i++) {
                PrescriptionHerb herb = herbs.get(i);
                herb.setPrescriptionId(prescription.getId());
                herb.setSortOrder(i + 1);
                prescriptionHerbRepository.insert(herb);
            }
        }
        return true;
    }

    public boolean updateStatus(Long id, Integer status) {
        Prescription prescription = new Prescription();
        prescription.setId(id);
        prescription.setStatus(status);
        return prescriptionRepository.updateById(prescription) > 0;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean delete(Long id) {
        LambdaQueryWrapper<PrescriptionHerb> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PrescriptionHerb::getPrescriptionId, id);
        prescriptionHerbRepository.delete(wrapper);
        return prescriptionRepository.deleteById(id) > 0;
    }
}
