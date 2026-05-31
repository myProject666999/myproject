package com.votingscheduling.service;

import com.votingscheduling.entity.ShiftSwap;
import com.votingscheduling.entity.ScheduleHistory;
import com.votingscheduling.entity.ScheduleSlot;
import com.votingscheduling.repository.ShiftSwapRepository;
import com.votingscheduling.repository.ScheduleSlotRepository;
import com.votingscheduling.repository.ScheduleHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShiftSwapService {

    private final ShiftSwapRepository shiftSwapRepository;
    private final ScheduleSlotRepository scheduleSlotRepository;
    private final ScheduleHistoryRepository scheduleHistoryRepository;

    public List<ShiftSwap> findByOriginalUserId(Long userId) {
        return shiftSwapRepository.findByOriginalUserId(userId);
    }

    public List<ShiftSwap> findBySwapUserId(Long userId) {
        return shiftSwapRepository.findBySwapUserId(userId);
    }

    public List<ShiftSwap> findByUser(Long userId) {
        return shiftSwapRepository.findByOriginalUserIdOrSwapUserId(userId, userId);
    }

    public List<ShiftSwap> findByStatus(String status) {
        return shiftSwapRepository.findByStatus(status);
    }

    public ShiftSwap findById(Long id) {
        return shiftSwapRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shift swap not found"));
    }

    @Transactional
    public ShiftSwap create(ShiftSwap swap, Long currentUserId) {
        ScheduleSlot slot = scheduleSlotRepository.findById(swap.getSlotId())
                .orElseThrow(() -> new RuntimeException("Schedule slot not found"));

        if (!slot.getUserId().equals(currentUserId)) {
            throw new RuntimeException("Can only swap your own shift");
        }

        swap.setOriginalUserId(currentUserId);
        swap.setStatus("PENDING");
        swap = shiftSwapRepository.save(swap);

        slot.setStatus("SWAP_PENDING");
        scheduleSlotRepository.save(slot);

        return swap;
    }

    @Transactional
    public ShiftSwap approve(Long id, Long approverId, String comment) {
        ShiftSwap swap = findById(id);
        if (!"PENDING".equals(swap.getStatus())) {
            throw new RuntimeException("Already processed");
        }

        ScheduleSlot slot = scheduleSlotRepository.findById(swap.getSlotId())
                .orElseThrow(() -> new RuntimeException("Schedule slot not found"));

        List<ScheduleSlot> conflicts = scheduleSlotRepository.findConflictingSlots(
                swap.getSwapUserId(), slot.getDate(), slot.getStartTime(), slot.getEndTime());
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Swap user has conflicting schedule");
        }

        Long oldUserId = slot.getUserId();
        slot.setUserId(swap.getSwapUserId());
        slot.setStatus("ASSIGNED");
        scheduleSlotRepository.save(slot);

        swap.setStatus("APPROVED");
        swap.setApproverId(approverId);
        swap.setApproveTime(LocalDateTime.now());
        swap.setApproveComment(comment);
        shiftSwapRepository.save(swap);

        ScheduleHistory history = ScheduleHistory.builder()
                .slotId(slot.getId())
                .action("SWAP")
                .actionUserId(approverId)
                .oldUserId(oldUserId)
                .newUserId(swap.getSwapUserId())
                .detail("Swap approved: " + comment)
                .build();
        scheduleHistoryRepository.save(history);

        return swap;
    }

    @Transactional
    public ShiftSwap reject(Long id, Long approverId, String comment) {
        ShiftSwap swap = findById(id);
        if (!"PENDING".equals(swap.getStatus())) {
            throw new RuntimeException("Already processed");
        }

        ScheduleSlot slot = scheduleSlotRepository.findById(swap.getSlotId())
                .orElseThrow(() -> new RuntimeException("Schedule slot not found"));
        slot.setStatus("ASSIGNED");
        scheduleSlotRepository.save(slot);

        swap.setStatus("REJECTED");
        swap.setApproverId(approverId);
        swap.setApproveTime(LocalDateTime.now());
        swap.setApproveComment(comment);
        return shiftSwapRepository.save(swap);
    }

    @Transactional
    public ShiftSwap cancel(Long id, Long currentUserId) {
        ShiftSwap swap = findById(id);
        if (!"PENDING".equals(swap.getStatus())) {
            throw new RuntimeException("Already processed");
        }
        if (!swap.getOriginalUserId().equals(currentUserId)) {
            throw new RuntimeException("Can only cancel your own swap");
        }

        ScheduleSlot slot = scheduleSlotRepository.findById(swap.getSlotId())
                .orElseThrow(() -> new RuntimeException("Schedule slot not found"));
        slot.setStatus("ASSIGNED");
        scheduleSlotRepository.save(slot);

        swap.setStatus("CANCELLED");
        return shiftSwapRepository.save(swap);
    }
}
