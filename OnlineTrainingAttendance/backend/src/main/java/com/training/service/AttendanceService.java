package com.training.service;

import com.training.common.Result;
import com.training.common.ResultCode;
import com.training.entity.Attendance;
import com.training.entity.CheckinSession;
import com.training.entity.Student;
import com.training.entity.Training;
import com.training.entity.TrainingStudent;
import com.training.repository.AttendanceRepository;
import com.training.repository.CheckinSessionRepository;
import com.training.repository.StudentRepository;
import com.training.repository.TrainingRepository;
import com.training.repository.TrainingStudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final CheckinSessionRepository checkinSessionRepository;
    private final StudentRepository studentRepository;
    private final TrainingRepository trainingRepository;
    private final TrainingStudentRepository trainingStudentRepository;

    @Transactional
    public Result<Attendance> checkInByQr(String sessionToken, Long studentId,
                                           String ipAddress, String deviceInfo) {
        Optional<CheckinSession> sessionOpt = checkinSessionRepository
                .findValidBySessionToken(sessionToken, LocalDateTime.now());
        if (!sessionOpt.isPresent()) {
            return Result.fail(ResultCode.ATTENDANCE_INVALID_QR);
        }
        CheckinSession session = sessionOpt.get();
        Long trainingId = session.getTrainingId();
        return doCheckIn(trainingId, studentId, 1, ipAddress, deviceInfo, "扫码签到");
    }

    @Transactional
    public Result<Attendance> manualCheckIn(Long trainingId, Long studentId,
                                            String ipAddress, String remark) {
        return doCheckIn(trainingId, studentId, 2, ipAddress, null,
                remark == null ? "手动签到" : remark);
    }

    private Result<Attendance> doCheckIn(Long trainingId, Long studentId, int type,
                                         String ipAddress, String deviceInfo, String remark) {
        Optional<Training> trainingOpt = trainingRepository.findById(trainingId);
        if (!trainingOpt.isPresent()) {
            return Result.fail(ResultCode.TRAINING_NOT_FOUND);
        }
        Optional<Student> studentOpt = studentRepository.findById(studentId);
        if (!studentOpt.isPresent()) {
            return Result.fail(ResultCode.STUDENT_NOT_FOUND);
        }
        Optional<TrainingStudent> tsOpt = trainingStudentRepository
                .findByTrainingIdAndStudentId(trainingId, studentId);
        if (!tsOpt.isPresent()) {
            return Result.fail(ResultCode.STUDENT_NOT_ENROLLED);
        }
        LocalDateTime todayStart = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1);
        List<Attendance> exist = attendanceRepository
                .findByTrainingIdAndCheckInTimeBetween(trainingId, todayStart, todayEnd);
        boolean alreadyChecked = exist.stream()
                .anyMatch(a -> a.getStudentId().equals(studentId));
        if (alreadyChecked) {
            return Result.fail(ResultCode.ATTENDANCE_CHECKED);
        }
        Attendance attendance = new Attendance();
        attendance.setTrainingId(trainingId);
        attendance.setStudentId(studentId);
        attendance.setCheckInTime(LocalDateTime.now());
        attendance.setCheckInType(type);
        attendance.setIpAddress(ipAddress);
        attendance.setDeviceInfo(deviceInfo);
        attendance.setRemark(remark);
        attendance.setCreatedAt(LocalDateTime.now());
        Attendance saved = attendanceRepository.save(attendance);

        TrainingStudent ts = tsOpt.get();
        int count = ts.getAttendanceCount() == null ? 0 : ts.getAttendanceCount();
        ts.setAttendanceCount(count + 1);
        if (ts.getTotalClasses() != null && ts.getTotalClasses() > 0) {
            BigDecimal rate = BigDecimal.valueOf(ts.getAttendanceCount())
                    .divide(BigDecimal.valueOf(ts.getTotalClasses()), 2, RoundingMode.HALF_UP);
            ts.setAttendanceRate(rate);
        }
        ts.setUpdatedAt(LocalDateTime.now());
        trainingStudentRepository.save(ts);
        return Result.success(saved);
    }

    public Result<String> delete(Long id) {
        if (!attendanceRepository.existsById(id)) {
            return Result.fail(ResultCode.NOT_FOUND);
        }
        attendanceRepository.deleteById(id);
        return Result.success("删除成功");
    }

    public Result<List<Attendance>> listByTraining(Long trainingId) {
        return Result.success(attendanceRepository.findByTrainingId(trainingId));
    }

    public Result<List<Attendance>> listByStudent(Long studentId) {
        return Result.success(attendanceRepository.findByStudentId(studentId));
    }

    public Result<List<Attendance>> listByTrainingAndStudent(Long trainingId, Long studentId) {
        return Result.success(attendanceRepository.findByTrainingIdAndStudentId(trainingId, studentId));
    }

    public Result<Map<String, Object>> statistics(Long trainingId) {
        Optional<Training> trainingOpt = trainingRepository.findById(trainingId);
        if (!trainingOpt.isPresent()) {
            return Result.fail(ResultCode.TRAINING_NOT_FOUND);
        }
        List<TrainingStudent> enrolled = trainingStudentRepository.findByTrainingId(trainingId);
        long totalStudents = enrolled.size();
        long checkedCount = attendanceRepository.countByTrainingIdAndStudentId(trainingId,
                enrolled.isEmpty() ? 0L : enrolled.get(0).getStudentId());

        Map<Long, Long> perStudentCount = new HashMap<>();
        List<Attendance> all = attendanceRepository.findByTrainingId(trainingId);
        for (Attendance a : all) {
            perStudentCount.merge(a.getStudentId(), 1L, Long::sum);
        }
        long qualifiedCount = 0L;
        Training training = trainingOpt.get();
        BigDecimal minRate = training.getMinAttendanceRate();
        if (minRate == null) {
            minRate = BigDecimal.valueOf(0.8);
        }
        int totalClasses = training.getTotalHours() != null
                ? training.getTotalHours().intValue() : 0;
        for (TrainingStudent ts : enrolled) {
            if (totalClasses <= 0) {
                qualifiedCount++;
                continue;
            }
            Long count = perStudentCount.getOrDefault(ts.getStudentId(), 0L);
            BigDecimal rate = BigDecimal.valueOf(count)
                    .divide(BigDecimal.valueOf(totalClasses), 2, RoundingMode.HALF_UP);
            if (rate.compareTo(minRate) >= 0) {
                qualifiedCount++;
            }
        }

        Map<String, Object> stat = new HashMap<>();
        stat.put("trainingId", trainingId);
        stat.put("trainingName", training.getName());
        stat.put("totalStudents", totalStudents);
        stat.put("totalAttendanceRecords", all.size());
        stat.put("qualifiedStudents", qualifiedCount);
        stat.put("perStudentCount", perStudentCount);
        return Result.success(stat);
    }
}
