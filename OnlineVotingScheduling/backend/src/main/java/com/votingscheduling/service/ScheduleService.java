package com.votingscheduling.service;

import com.votingscheduling.entity.*;
import com.votingscheduling.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final ScheduleSlotRepository scheduleSlotRepository;
    private final AvailableTimeRepository availableTimeRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ScheduleHistoryRepository scheduleHistoryRepository;

    public List<Schedule> findByTeamId(Long teamId) {
        return scheduleRepository.findByTeamId(teamId);
    }

    public List<Schedule> findByTeamIdAndStatus(Long teamId, String status) {
        return scheduleRepository.findByTeamIdAndStatus(teamId, status);
    }

    public Schedule findById(Long id) {
        return scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule does not exist"));
    }

    @Transactional
    public Schedule create(Schedule schedule, Long createdBy) {
        schedule.setCreatedBy(createdBy);
        schedule.setStatus("DRAFT");
        return scheduleRepository.save(schedule);
    }

    @Transactional
    public Schedule update(Long id, Schedule schedule) {
        Schedule existing = findById(id);
        if (schedule.getName() != null) existing.setName(schedule.getName());
        if (schedule.getType() != null) existing.setType(schedule.getType());
        if (schedule.getStartDate() != null) existing.setStartDate(schedule.getStartDate());
        if (schedule.getEndDate() != null) existing.setEndDate(schedule.getEndDate());
        return scheduleRepository.save(existing);
    }

    @Transactional
    public void publish(Long id) {
        Schedule schedule = findById(id);
        schedule.setStatus("PUBLISHED");
        scheduleRepository.save(schedule);
    }

    @Transactional
    public void archive(Long id) {
        Schedule schedule = findById(id);
        schedule.setStatus("ARCHIVED");
        scheduleRepository.save(schedule);
    }

    @Transactional
    public void delete(Long id) {
        scheduleSlotRepository.deleteAll(scheduleSlotRepository.findByScheduleId(id));
        scheduleRepository.deleteById(id);
    }

    @Transactional
    public List<ScheduleSlot> autoAssign(Long scheduleId) {
        Schedule schedule = findById(scheduleId);
        List<ScheduleSlot> slots = scheduleSlotRepository.findByScheduleId(scheduleId);

        List<TeamMember> members = teamMemberRepository.findByTeamId(schedule.getTeamId());
        List<Long> memberIds = members.stream().map(TeamMember::getUserId).collect(Collectors.toList());

        Map<Long, Integer> userAssignCount = new HashMap<>();
        for (Long memberId : memberIds) {
            userAssignCount.put(memberId, 0);
        }

        List<AvailableTime> allAvailable = availableTimeRepository.findByTeamId(schedule.getTeamId());
        Map<Integer, List<AvailableTime>> availableByWeekDay = allAvailable.stream()
                .collect(Collectors.groupingBy(AvailableTime::getWeekDay));

        for (ScheduleSlot slot : slots) {
            if (slot.getUserId() != null) {
                userAssignCount.merge(slot.getUserId(), 1, Integer::sum);
            }
        }

        List<ScheduleSlot> unassigned = slots.stream()
                .filter(s -> s.getUserId() == null)
                .collect(Collectors.toList());

        for (ScheduleSlot slot : unassigned) {
            List<AvailableTime> candidates = availableByWeekDay
                    .getOrDefault(slot.getWeekDay(), Collections.emptyList())
                    .stream()
                    .filter(a -> memberIds.contains(a.getUserId()))
                    .filter(a -> isTimeOverlap(a.getStartTime(), a.getEndTime(),
                            slot.getStartTime(), slot.getEndTime()))
                    .filter(a -> !hasConflict(scheduleId, a.getUserId(), slot.getDate(),
                            slot.getStartTime(), slot.getEndTime()))
                    .sorted(Comparator
                            .comparingInt((AvailableTime a) -> userAssignCount.getOrDefault(a.getUserId(), 0))
                            .thenComparing(Comparator.comparingInt(AvailableTime::getPriority).reversed()))
                    .collect(Collectors.toList());

            if (!candidates.isEmpty()) {
                AvailableTime chosen = candidates.get(0);
                slot.setUserId(chosen.getUserId());
                slot.setIsAutoAssigned(true);
                slot.setStatus("ASSIGNED");
                userAssignCount.merge(chosen.getUserId(), 1, Integer::sum);

                recordHistory(slot.getId(), schedule.getCreatedBy(), null, chosen.getUserId(),
                        "Auto-assigned duty");
            }
        }

        return scheduleSlotRepository.saveAll(slots);
    }

    @Transactional
    public ScheduleSlot assignSlot(Long slotId, Long userId, Long operatorId) {
        ScheduleSlot slot = scheduleSlotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Schedule slot does not exist"));

        if (hasConflict(slot.getScheduleId(), userId, slot.getDate(),
                slot.getStartTime(), slot.getEndTime())) {
            throw new RuntimeException("User already has other duty assignment for this time period");
        }

        Long oldUserId = slot.getUserId();
        slot.setUserId(userId);
        slot.setIsAutoAssigned(false);
        slot.setStatus("ASSIGNED");
        slot = scheduleSlotRepository.save(slot);

        recordHistory(slotId, operatorId, oldUserId, userId, "Manual duty assignment");

        return slot;
    }

    public boolean hasConflict(Long scheduleId, Long userId, LocalDate date,
                               LocalTime startTime, LocalTime endTime) {
        List<ScheduleSlot> existing = scheduleSlotRepository.findConflictingSlots(userId, date, startTime, endTime);
        return existing.stream()
                .anyMatch(s -> !s.getId().equals(scheduleId));
    }

    public boolean isTimeOverlap(LocalTime start1, LocalTime end1,
                                  LocalTime start2, LocalTime end2) {
        return start1.isBefore(end2) && end1.isAfter(start2);
    }

    @Transactional
    public List<ScheduleSlot> generateSlots(Long scheduleId, LocalTime defaultStartTime, LocalTime defaultEndTime) {
        Schedule schedule = findById(scheduleId);
        List<ScheduleSlot> existingSlots = scheduleSlotRepository.findByScheduleId(scheduleId);
        if (!existingSlots.isEmpty()) {
            return existingSlots;
        }

        List<ScheduleSlot> slots = new ArrayList<>();
        LocalDate current = schedule.getStartDate();

        while (!current.isAfter(schedule.getEndDate())) {
            int weekDay = current.getDayOfWeek().getValue();

            ScheduleSlot slot = ScheduleSlot.builder()
                    .scheduleId(scheduleId)
                    .date(current)
                    .weekDay(weekDay)
                    .startTime(defaultStartTime)
                    .endTime(defaultEndTime)
                    .userId(null)
                    .isAutoAssigned(false)
                    .status("ASSIGNED")
                    .build();

            slots.add(slot);
            current = current.plusDays(1);
        }

        return scheduleSlotRepository.saveAll(slots);
    }

    private void recordHistory(Long slotId, Long actionUserId, Long oldUserId, Long newUserId, String detail) {
        ScheduleHistory history = ScheduleHistory.builder()
                .slotId(slotId)
                .action(oldUserId != null && newUserId != null && !oldUserId.equals(newUserId) ? "REASSIGN" : "ASSIGN")
                .actionUserId(actionUserId)
                .oldUserId(oldUserId)
                .newUserId(newUserId)
                .detail(detail)
                .build();
        scheduleHistoryRepository.save(history);
    }
}