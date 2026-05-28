package com.training.service;

import com.training.common.Result;
import com.training.common.ResultCode;
import com.training.entity.Attendance;
import com.training.entity.Certificate;
import com.training.entity.Student;
import com.training.entity.Training;
import com.training.repository.AttendanceRepository;
import com.training.repository.CertificateRepository;
import com.training.repository.StudentRepository;
import com.training.repository.TrainingRepository;
import com.training.util.QRCodeUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainingService {

    private final TrainingRepository trainingRepository;
    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final CertificateRepository certificateRepository;
    private final CertificateService certificateService;

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

    public Result<Map<String, Object>> batchGenerateCertificates(Long trainingId) {
        Optional<Training> trainingOpt = trainingRepository.findById(trainingId);
        if (!trainingOpt.isPresent()) {
            return Result.fail(ResultCode.TRAINING_NOT_FOUND);
        }
        Training training = trainingOpt.get();
        List<Student> students = studentRepository.findAll();
        List<Attendance> attendances = attendanceRepository.findByTrainingId(trainingId);
        Map<Long, List<Attendance>> attendanceMap = attendances.stream()
                .collect(Collectors.groupingBy(Attendance::getStudentId));
        Set<Long> existingCerts = certificateRepository.findByTrainingId(trainingId)
                .stream().map(Certificate::getStudentId).collect(Collectors.toSet());
        List<Certificate> generated = new ArrayList<>();
        List<String> skipped = new ArrayList<>();
        double minRate = training.getMinAttendanceRate() == null ? 80.0 : training.getMinAttendanceRate().doubleValue();
        for (Student student : students) {
            if (existingCerts.contains(student.getId())) {
                skipped.add(student.getName() + "（已存在证书）");
                continue;
            }
            List<Attendance> studentAttendance = attendanceMap.getOrDefault(student.getId(), new ArrayList<>());
            long totalSessions = 1;
            double rate = totalSessions > 0 ? (studentAttendance.size() * 100.0 / totalSessions) : 0;
            if (rate < minRate) {
                skipped.add(student.getName() + String.format("（出勤率%.1f%%，未达到%.0f%%）", rate, minRate));
                continue;
            }
            Certificate cert = new Certificate();
            cert.setTrainingId(trainingId);
            cert.setStudentId(student.getId());
            cert.setStudentName(student.getName());
            cert.setTrainingName(training.getName());
            cert.setInstructor(training.getInstructor());
            cert.setIssueDate(LocalDate.now());
            Result<Certificate> result = certificateService.issue(cert);
            if (result.getCode() == 200 && result.getData() != null) {
                generated.add(result.getData());
            } else {
                skipped.add(student.getName() + "（" + result.getMessage() + "）");
            }
        }
        Map<String, Object> res = new HashMap<>();
        res.put("generated", generated);
        res.put("generatedCount", generated.size());
        res.put("skipped", skipped);
        res.put("skippedCount", skipped.size());
        res.put("totalCount", students.size());
        return Result.success(res);
    }

    public Result<List<Map<String, Object>>> getAttendanceReport(Long trainingId) {
        Optional<Training> trainingOpt = trainingRepository.findById(trainingId);
        if (!trainingOpt.isPresent()) {
            return Result.fail(ResultCode.TRAINING_NOT_FOUND);
        }
        Training training = trainingOpt.get();
        List<Student> students = studentRepository.findAll();
        List<Attendance> attendances = attendanceRepository.findByTrainingId(trainingId);
        Map<Long, List<Attendance>> attendanceMap = attendances.stream()
                .collect(Collectors.groupingBy(Attendance::getStudentId));
        List<Map<String, Object>> report = new ArrayList<>();
        int index = 1;
        for (Student student : students) {
            List<Attendance> studentAttendance = attendanceMap.getOrDefault(student.getId(), new ArrayList<>());
            Map<String, Object> row = new HashMap<>();
            row.put("index", index++);
            row.put("studentId", student.getId());
            row.put("studentName", student.getName());
            row.put("idCard", student.getIdCard());
            row.put("phone", student.getPhone());
            row.put("checkinCount", studentAttendance.size());
            row.put("totalSessions", 1);
            double rate = studentAttendance.size() * 100.0;
            row.put("attendanceRate", String.format("%.1f%%", rate));
            double minRate = training.getMinAttendanceRate() == null ? 80.0 : training.getMinAttendanceRate().doubleValue();
            row.put("isPassed", rate >= minRate);
            if (!studentAttendance.isEmpty()) {
                Attendance last = studentAttendance.get(studentAttendance.size() - 1);
                row.put("lastCheckinTime", last.getCheckInTime());
                row.put("checkinType", last.getCheckInType() == 1 ? "二维码签到" : "手动签到");
                row.put("ipAddress", last.getIpAddress());
            } else {
                row.put("lastCheckinTime", "-");
                row.put("checkinType", "-");
                row.put("ipAddress", "-");
            }
            report.add(row);
        }
        return Result.success(report);
    }
}
