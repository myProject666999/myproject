package com.training.service;

import com.training.common.Result;
import com.training.common.ResultCode;
import com.training.entity.Training;
import com.training.repository.TrainingRepository;
import com.training.util.QRCodeUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TrainingService {

    private final TrainingRepository trainingRepository;

    public Result<Training> add(Training training) {
        LocalDateTime now = LocalDateTime.now();
        if (training.getStatus() == null) {
            training.setStatus(1);
        }
        training.setCreatedAt(now);
        training.setUpdatedAt(now);
        Training saved = trainingRepository.save(training);
        return Result.success(saved);
    }

    public Result<String> delete(Long id) {
        if (!trainingRepository.existsById(id)) {
            return Result.fail(ResultCode.TRAINING_NOT_FOUND);
        }
        trainingRepository.deleteById(id);
        return Result.success("删除成功");
    }

    public Result<Training> update(Training training) {
        if (training.getId() == null || !trainingRepository.existsById(training.getId())) {
            return Result.fail(ResultCode.TRAINING_NOT_FOUND);
        }
        Training db = trainingRepository.findById(training.getId()).get();
        if (training.getName() != null) {
            db.setName(training.getName());
        }
        if (training.getDescription() != null) {
            db.setDescription(training.getDescription());
        }
        if (training.getInstructor() != null) {
            db.setInstructor(training.getInstructor());
        }
        if (training.getStartDate() != null) {
            db.setStartDate(training.getStartDate());
        }
        if (training.getEndDate() != null) {
            db.setEndDate(training.getEndDate());
        }
        if (training.getTotalHours() != null) {
            db.setTotalHours(training.getTotalHours());
        }
        if (training.getMinAttendanceRate() != null) {
            db.setMinAttendanceRate(training.getMinAttendanceRate());
        }
        if (training.getStatus() != null) {
            db.setStatus(training.getStatus());
        }
        db.setUpdatedAt(LocalDateTime.now());
        return Result.success(trainingRepository.save(db));
    }

    public Result<Training> getById(Long id) {
        Optional<Training> optional = trainingRepository.findById(id);
        if (!optional.isPresent()) {
            return Result.fail(ResultCode.TRAINING_NOT_FOUND);
        }
        return Result.success(optional.get());
    }

    public Result<List<Training>> list(String name, Integer status) {
        List<Training> list;
        if (name != null && !name.isEmpty() && status != null) {
            list = trainingRepository.findByNameContainingAndStatus(name, status);
        } else if (name != null && !name.isEmpty()) {
            list = trainingRepository.findByNameContaining(name);
        } else if (status != null) {
            list = trainingRepository.findByStatus(status);
        } else {
            list = trainingRepository.findAll();
        }
        return Result.success(list);
    }

    public Result<List<Training>> listOngoing() {
        return Result.success(trainingRepository.findOngoingTrainings(LocalDate.now()));
    }

    public Result<List<Training>> listEnded() {
        return Result.success(trainingRepository.findEndedTrainings(LocalDate.now()));
    }

    public Result<List<Training>> listUpcoming() {
        return Result.success(trainingRepository.findUpcomingTrainings(LocalDate.now()));
    }

    public Result<String> generateQrCode(Long id, String baseUrl) {
        Optional<Training> optional = trainingRepository.findById(id);
        if (!optional.isPresent()) {
            return Result.fail(ResultCode.TRAINING_NOT_FOUND);
        }
        Training training = optional.get();
        String token = UUID.randomUUID().toString().replace("-", "");
        String content = (baseUrl == null ? "" : baseUrl) + "/training/" + training.getId() + "?token=" + token;
        try {
            byte[] qrBytes = QRCodeUtil.generateBytes(content);
            String dataUrl = "data:image/png;base64," + java.util.Base64.getEncoder().encodeToString(qrBytes);
            training.setQrCode(dataUrl);
            training.setUpdatedAt(LocalDateTime.now());
            trainingRepository.save(training);
            return Result.success("生成成功", dataUrl);
        } catch (Exception e) {
            return Result.fail("二维码生成失败: " + e.getMessage());
        }
    }
}
