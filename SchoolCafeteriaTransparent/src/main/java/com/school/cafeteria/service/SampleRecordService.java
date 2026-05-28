package com.school.cafeteria.service;

import com.school.cafeteria.entity.SampleRecord;
import com.school.cafeteria.repository.SampleRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SampleRecordService {

    @Autowired
    private SampleRecordRepository sampleRecordRepository;

    public SampleRecord save(SampleRecord record) {
        if (record.getSampleNo() == null || record.getSampleNo().isEmpty()) {
            record.setSampleNo(generateSampleNo());
        }
        return sampleRecordRepository.save(record);
    }

    private String generateSampleNo() {
        return "SAMPLE" + System.currentTimeMillis();
    }

    public Optional<SampleRecord> findById(Long id) {
        return sampleRecordRepository.findById(id);
    }

    public Optional<SampleRecord> findBySampleNo(String sampleNo) {
        return sampleRecordRepository.findBySampleNo(sampleNo);
    }

    public List<SampleRecord> findByDate(LocalDate date) {
        return sampleRecordRepository.findBySampleDateOrderBySampleTime(date);
    }

    public List<SampleRecord> findByDateRange(LocalDate startDate, LocalDate endDate) {
        return sampleRecordRepository.findByDateRange(startDate, endDate);
    }

    public List<SampleRecord> searchByDishName(String keyword) {
        return sampleRecordRepository.findByDishNameContaining(keyword);
    }

    public List<SampleRecord> findAll() {
        return sampleRecordRepository.findAll();
    }

    public SampleRecord disposal(Long id, String disposalPerson, String disposalImage) {
        Optional<SampleRecord> optional = sampleRecordRepository.findById(id);
        if (optional.isPresent()) {
            SampleRecord record = optional.get();
            record.setDisposalTime(LocalDateTime.now());
            record.setDisposalPerson(disposalPerson);
            record.setDisposalImage(disposalImage);
            return sampleRecordRepository.save(record);
        }
        return null;
    }

    public void delete(Long id) {
        sampleRecordRepository.deleteById(id);
    }
}
