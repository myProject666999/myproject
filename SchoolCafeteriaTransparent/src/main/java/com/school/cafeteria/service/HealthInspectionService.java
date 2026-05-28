package com.school.cafeteria.service;

import com.school.cafeteria.entity.HealthInspection;
import com.school.cafeteria.entity.Rectification;
import com.school.cafeteria.repository.HealthInspectionRepository;
import com.school.cafeteria.repository.RectificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class HealthInspectionService {

    @Autowired
    private HealthInspectionRepository healthInspectionRepository;

    @Autowired
    private RectificationRepository rectificationRepository;

    public HealthInspection save(HealthInspection inspection) {
        if (inspection.getInspectionNo() == null || inspection.getInspectionNo().isEmpty()) {
            inspection.setInspectionNo(generateInspectionNo());
        }
        return healthInspectionRepository.save(inspection);
    }

    private String generateInspectionNo() {
        return "CHECK" + System.currentTimeMillis();
    }

    public Optional<HealthInspection> findById(Long id) {
        Optional<HealthInspection> inspection = healthInspectionRepository.findById(id);
        inspection.ifPresent(this::loadRectification);
        return inspection;
    }

    public Optional<HealthInspection> findByInspectionNo(String inspectionNo) {
        Optional<HealthInspection> inspection = healthInspectionRepository.findByInspectionNo(inspectionNo);
        inspection.ifPresent(this::loadRectification);
        return inspection;
    }

    public List<HealthInspection> findByDateRange(LocalDate startDate, LocalDate endDate) {
        List<HealthInspection> inspections = healthInspectionRepository.findByDateRange(startDate, endDate);
        inspections.forEach(this::loadRectification);
        return inspections;
    }

    public List<HealthInspection> findByRectifyStatus(String status) {
        return healthInspectionRepository.findByRectifyStatus(status);
    }

    public List<HealthInspection> findByType(String inspectionType) {
        return healthInspectionRepository.findByInspectionType(inspectionType);
    }

    public List<HealthInspection> findAll() {
        List<HealthInspection> inspections = healthInspectionRepository.findAll();
        inspections.forEach(this::loadRectification);
        return inspections;
    }

    @Transactional
    public Rectification submitRectification(Rectification rectification) {
        Rectification saved = rectificationRepository.save(rectification);
        updateInspectionStatus(rectification.getInspectionId(), "IN_PROGRESS");
        return saved;
    }

    @Transactional
    public Rectification completeRectification(Long inspectionId, String rectifyDescription, String rectifyImages) {
        Optional<Rectification> optional = rectificationRepository.findByInspectionId(inspectionId);
        if (optional.isPresent()) {
            Rectification rectification = optional.get();
            rectification.setRectifyEndDate(LocalDate.now());
            rectification.setRectifyDescription(rectifyDescription);
            rectification.setRectifyImages(rectifyImages);
            updateInspectionStatus(inspectionId, "COMPLETED");
            return rectificationRepository.save(rectification);
        }
        return null;
    }

    @Transactional
    public Rectification verifyRectification(Long inspectionId, String verifyPerson, String verifyResult, String verifyComment) {
        Optional<Rectification> optional = rectificationRepository.findByInspectionId(inspectionId);
        if (optional.isPresent()) {
            Rectification rectification = optional.get();
            rectification.setVerifyPerson(verifyPerson);
            rectification.setVerifyDate(LocalDate.now());
            rectification.setVerifyResult(verifyResult);
            rectification.setVerifyComment(verifyComment);
            if ("PASS".equals(verifyResult)) {
                updateInspectionStatus(inspectionId, "VERIFIED");
            } else {
                updateInspectionStatus(inspectionId, "IN_PROGRESS");
            }
            return rectificationRepository.save(rectification);
        }
        return null;
    }

    public Optional<Rectification> findRectificationByInspectionId(Long inspectionId) {
        return rectificationRepository.findByInspectionId(inspectionId);
    }

    public Map<String, Object> getInspectionStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("pendingCount", healthInspectionRepository.countByRectifyStatus("PENDING"));
        stats.put("inProgressCount", healthInspectionRepository.countByRectifyStatus("IN_PROGRESS"));
        stats.put("completedCount", healthInspectionRepository.countByRectifyStatus("COMPLETED"));
        stats.put("verifiedCount", healthInspectionRepository.countByRectifyStatus("VERIFIED"));
        return stats;
    }

    public void delete(Long id) {
        healthInspectionRepository.deleteById(id);
    }

    private void updateInspectionStatus(Long inspectionId, String status) {
        Optional<HealthInspection> inspection = healthInspectionRepository.findById(inspectionId);
        inspection.ifPresent(i -> {
            i.setRectifyStatus(status);
            healthInspectionRepository.save(i);
        });
    }

    private void loadRectification(HealthInspection inspection) {
        Optional<Rectification> rectification = rectificationRepository.findByInspectionId(inspection.getId());
        rectification.ifPresent(inspection::setRectification);
    }
}
