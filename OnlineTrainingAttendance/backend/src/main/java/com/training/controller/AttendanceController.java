package com.training.controller;

import com.training.common.Result;
import com.training.entity.Attendance;
import com.training.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/checkin-by-qr")
    public Result<Attendance> checkInByQr(@RequestParam String sessionToken,
                                          @RequestParam Long studentId,
                                          @RequestParam(required = false) String ipAddress,
                                          @RequestParam(required = false) String deviceInfo) {
        return attendanceService.checkInByQr(sessionToken, studentId, ipAddress, deviceInfo);
    }

    @PostMapping("/manual-checkin")
    public Result<Attendance> manualCheckIn(@RequestParam Long trainingId,
                                            @RequestParam Long studentId,
                                            @RequestParam(required = false) String ipAddress,
                                            @RequestParam(required = false) String remark) {
        return attendanceService.manualCheckIn(trainingId, studentId, ipAddress, remark);
    }

    @GetMapping("/training/{trainingId}")
    public Result<List<Attendance>> listByTraining(@PathVariable Long trainingId) {
        return attendanceService.listByTraining(trainingId);
    }

    @GetMapping("/student/{studentId}")
    public Result<List<Attendance>> listByStudent(@PathVariable Long studentId) {
        return attendanceService.listByStudent(studentId);
    }

    @GetMapping
    public Result<List<Attendance>> listByTrainingAndStudent(@RequestParam Long trainingId,
                                                             @RequestParam Long studentId) {
        return attendanceService.listByTrainingAndStudent(trainingId, studentId);
    }

    @GetMapping("/statistics/{trainingId}")
    public Result<Map<String, Object>> statistics(@PathVariable Long trainingId) {
        return attendanceService.statistics(trainingId);
    }

    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id) {
        return attendanceService.delete(id);
    }
}
