package com.votingscheduling.service;

import com.votingscheduling.entity.ScheduleSlot;
import com.votingscheduling.repository.ScheduleSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleSlotService {

    private final ScheduleSlotRepository scheduleSlotRepository;

    public List<ScheduleSlot> findByScheduleId(Long scheduleId) {
        return scheduleSlotRepository.findByScheduleId(scheduleId);
    }

    public List<ScheduleSlot> findByScheduleIdAndDateRange(Long scheduleId, LocalDate startDate, LocalDate endDate) {
        return scheduleSlotRepository.findByScheduleIdAndDateBetween(scheduleId, startDate, endDate);
    }

    public List<ScheduleSlot> findByUserIdAndDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return scheduleSlotRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
    }

    public List<ScheduleSlot> findByUserId(Long userId) {
        return scheduleSlotRepository.findByUserId(userId);
    }

    @Transactional
    public ScheduleSlot save(ScheduleSlot slot) {
        return scheduleSlotRepository.save(slot);
    }

    @Transactional
    public List<ScheduleSlot> saveAll(List<ScheduleSlot> slots) {
        return scheduleSlotRepository.saveAll(slots);
    }

    @Transactional
    public void delete(Long id) {
        scheduleSlotRepository.deleteById(id);
    }
}
