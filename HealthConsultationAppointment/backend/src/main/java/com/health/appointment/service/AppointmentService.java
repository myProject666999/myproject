package com.health.appointment.service;

import com.health.appointment.entity.*;
import com.health.appointment.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class AppointmentService {

    private static final String SCHEDULE_LOCK_KEY = "schedule:lock:";
    private static final String SCHEDULE_COUNT_KEY = "schedule:count:";
    private static final long LOCK_EXPIRE_TIME = 10;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private QueueCallRepository queueCallRepository;

    @Autowired
    private SysConfigRepository sysConfigRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public List<Appointment> getAppointmentsByPatient(Long patientId) {
        List<Appointment> appointments = appointmentRepository.findByPatientIdOrderByCreatedTimeDesc(patientId);
        appointments.forEach(this::loadRelations);
        return appointments;
    }

    public Appointment getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id).orElse(null);
        if (appointment != null) {
            loadRelations(appointment);
        }
        return appointment;
    }

    @Transactional
    public Appointment createAppointment(Long scheduleId, String patientPhone, String patientName) throws Exception {
        Schedule schedule = scheduleRepository.findById(scheduleId).orElse(null);
        if (schedule == null) {
            throw new Exception("排班不存在");
        }
        if (schedule.getStatus() != 1 || schedule.getRemainingCount() <= 0) {
            throw new Exception("该排班已约满或已停诊");
        }

        Patient patient = patientRepository.findByPhone(patientPhone).orElse(null);
        if (patient == null) {
            patient = new Patient();
            patient.setPhone(patientPhone);
            patient.setName(patientName);
            patient = patientRepository.save(patient);
        }

        Long dailyCount = appointmentRepository.countByPatientIdAndScheduleDate(patient.getId(), schedule.getScheduleDate());
        int maxPerDay = getConfigIntValue("max_appointment_per_day", 2);
        if (dailyCount >= maxPerDay) {
            throw new Exception("每人每天最多预约" + maxPerDay + "个号");
        }

        boolean exists = appointmentRepository.existsByPatientIdAndScheduleIdAndStatusIn(
                patient.getId(), scheduleId, Arrays.asList(1, 2));
        if (exists) {
            throw new Exception("您已预约该排班，请勿重复预约");
        }

        String lockKey = SCHEDULE_LOCK_KEY + scheduleId;
        Boolean locked = redisTemplate.opsForValue().setIfAbsent(lockKey, patient.getId(), LOCK_EXPIRE_TIME, TimeUnit.SECONDS);
        if (locked == null || !locked) {
            throw new Exception("系统繁忙，请稍后重试");
        }

        try {
            String countKey = SCHEDULE_COUNT_KEY + scheduleId;
            Integer redisCount = (Integer) redisTemplate.opsForValue().get(countKey);
            if (redisCount == null) {
                redisCount = schedule.getRemainingCount();
                redisTemplate.opsForValue().set(countKey, redisCount, 1, TimeUnit.HOURS);
            }

            if (redisCount <= 0) {
                throw new Exception("号源已不足");
            }

            Long newCount = redisTemplate.opsForValue().decrement(countKey);
            if (newCount < 0) {
                throw new Exception("号源已不足");
            }

            int updated = scheduleRepository.decreaseRemainingCount(scheduleId);
            if (updated == 0) {
                redisTemplate.opsForValue().increment(countKey);
                throw new Exception("号源已不足");
            }

            Integer maxQueue = appointmentRepository.findMaxQueueNumberByScheduleId(scheduleId);
            int queueNumber = (maxQueue == null ? 0 : maxQueue) + 1;

            Appointment appointment = new Appointment();
            appointment.setAppointmentNo(generateAppointmentNo());
            appointment.setPatientId(patient.getId());
            appointment.setScheduleId(scheduleId);
            appointment.setDoctorId(schedule.getDoctorId());
            appointment.setDepartmentId(schedule.getDepartmentId());
            appointment.setScheduleDate(schedule.getScheduleDate());
            appointment.setTimePeriod(schedule.getTimePeriod());
            appointment.setQueueNumber(queueNumber);
            appointment.setConsultFee(schedule.getConsultFee());
            appointment.setStatus(1);
            appointment = appointmentRepository.save(appointment);

            QueueCall queueCall = new QueueCall();
            queueCall.setAppointmentId(appointment.getId());
            queueCall.setScheduleId(scheduleId);
            queueCall.setDoctorId(schedule.getDoctorId());
            queueCall.setPatientName(patient.getName());
            queueCall.setQueueNumber(queueNumber);
            queueCall.setStatus(0);
            queueCallRepository.save(queueCall);

            appointment.setPatient(patient);
            loadRelations(appointment);
            return appointment;
        } finally {
            redisTemplate.delete(lockKey);
        }
    }

    @Transactional
    public Appointment cancelAppointment(Long appointmentId, String reason) throws Exception {
        Appointment appointment = appointmentRepository.findById(appointmentId).orElse(null);
        if (appointment == null) {
            throw new Exception("预约记录不存在");
        }
        if (appointment.getStatus() != 1) {
            throw new Exception("该预约状态不允许取消");
        }

        int cancelLimitHours = getConfigIntValue("cancel_limit_hours", 24);
        LocalDateTime limitTime = appointment.getScheduleDate().atTime(appointment.getScheduleDate().atStartOfDay().toLocalTime());
        if (LocalDateTime.now().plusHours(cancelLimitHours).isAfter(limitTime)) {
        }

        appointment.setStatus(3);
        appointment.setCancelReason(reason);
        appointment.setCancelTime(LocalDateTime.now());
        appointmentRepository.save(appointment);

        scheduleRepository.increaseRemainingCount(appointment.getScheduleId());

        String countKey = SCHEDULE_COUNT_KEY + appointment.getScheduleId();
        redisTemplate.opsForValue().increment(countKey);

        QueueCall queueCall = queueCallRepository.findByAppointmentId(appointmentId).orElse(null);
        if (queueCall != null) {
            queueCall.setStatus(2);
            queueCallRepository.save(queueCall);
        }

        return appointment;
    }

    public void markMissedAppointments() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        List<Appointment> appointments = appointmentRepository.findByScheduleIdOrderByQueueNumberAsc(0L);
        for (Appointment appointment : appointments) {
            if (appointment.getScheduleDate().isBefore(yesterday) && appointment.getStatus() == 1) {
                appointment.setStatus(4);
                appointmentRepository.save(appointment);
            }
        }
    }

    private String generateAppointmentNo() {
        return "APT" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    private int getConfigIntValue(String key, int defaultValue) {
        return sysConfigRepository.findByConfigKey(key)
                .map(config -> Integer.parseInt(config.getConfigValue()))
                .orElse(defaultValue);
    }

    private void loadRelations(Appointment appointment) {
        if (appointment.getPatientId() != null) {
            Patient patient = patientRepository.findById(appointment.getPatientId()).orElse(null);
            appointment.setPatient(patient);
        }
    }
}
