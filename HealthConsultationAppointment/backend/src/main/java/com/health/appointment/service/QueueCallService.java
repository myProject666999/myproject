package com.health.appointment.service;

import com.health.appointment.entity.Appointment;
import com.health.appointment.entity.QueueCall;
import com.health.appointment.repository.AppointmentRepository;
import com.health.appointment.repository.QueueCallRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class QueueCallService {

    @Autowired
    private QueueCallRepository queueCallRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    public List<QueueCall> getQueueCalls(Long scheduleId, Long doctorId) {
        List<QueueCall> queueCalls = queueCallRepository.findByScheduleIdAndDoctorIdOrderByQueueNumberAsc(scheduleId, doctorId);
        queueCalls.forEach(this::loadAppointment);
        return queueCalls;
    }

    public List<QueueCall> getWaitingQueue(Long scheduleId, Long doctorId) {
        List<QueueCall> queueCalls = queueCallRepository.findByScheduleIdAndDoctorIdAndStatusOrderByQueueNumberAsc(scheduleId, doctorId, 0);
        queueCalls.forEach(this::loadAppointment);
        return queueCalls;
    }

    @Transactional
    public QueueCall callNext(Long scheduleId, Long doctorId) throws Exception {
        Optional<QueueCall> nextCallOpt = queueCallRepository.findNextToCall(scheduleId, doctorId);
        if (!nextCallOpt.isPresent()) {
            throw new Exception("没有等待叫号的患者");
        }

        QueueCall queueCall = nextCallOpt.get();
        queueCall.setStatus(1);
        queueCall.setCallCount(queueCall.getCallCount() + 1);
        if (queueCall.getFirstCallTime() == null) {
            queueCall.setFirstCallTime(LocalDateTime.now());
        }
        queueCall.setLastCallTime(LocalDateTime.now());
        queueCallRepository.save(queueCall);

        loadAppointment(queueCall);
        return queueCall;
    }

    @Transactional
    public QueueCall recall(Long queueCallId) throws Exception {
        QueueCall queueCall = queueCallRepository.findById(queueCallId).orElse(null);
        if (queueCall == null) {
            throw new Exception("叫号记录不存在");
        }
        if (queueCall.getStatus() == 3) {
            throw new Exception("该患者已就诊，无需重复叫号");
        }

        queueCall.setStatus(1);
        queueCall.setCallCount(queueCall.getCallCount() + 1);
        queueCall.setLastCallTime(LocalDateTime.now());
        queueCallRepository.save(queueCall);

        loadAppointment(queueCall);
        return queueCall;
    }

    @Transactional
    public QueueCall markVisited(Long queueCallId) throws Exception {
        QueueCall queueCall = queueCallRepository.findById(queueCallId).orElse(null);
        if (queueCall == null) {
            throw new Exception("叫号记录不存在");
        }

        queueCall.setStatus(3);
        queueCallRepository.save(queueCall);

        Appointment appointment = appointmentRepository.findById(queueCall.getAppointmentId()).orElse(null);
        if (appointment != null) {
            appointment.setStatus(2);
            appointment.setVisitTime(LocalDateTime.now());
            appointmentRepository.save(appointment);
        }

        loadAppointment(queueCall);
        return queueCall;
    }

    @Transactional
    public QueueCall markMissed(Long queueCallId) throws Exception {
        QueueCall queueCall = queueCallRepository.findById(queueCallId).orElse(null);
        if (queueCall == null) {
            throw new Exception("叫号记录不存在");
        }

        queueCall.setStatus(2);
        queueCallRepository.save(queueCall);

        loadAppointment(queueCall);
        return queueCall;
    }

    public QueueCall getCurrentCalling(Long scheduleId, Long doctorId) {
        List<QueueCall> calling = queueCallRepository.findByScheduleIdAndDoctorIdAndStatusOrderByQueueNumberAsc(scheduleId, doctorId, 1);
        if (!calling.isEmpty()) {
            QueueCall queueCall = calling.get(0);
            loadAppointment(queueCall);
            return queueCall;
        }
        return null;
    }

    private void loadAppointment(QueueCall queueCall) {
        if (queueCall.getAppointmentId() != null) {
            Appointment appointment = appointmentRepository.findById(queueCall.getAppointmentId()).orElse(null);
            queueCall.setAppointment(appointment);
        }
    }
}
