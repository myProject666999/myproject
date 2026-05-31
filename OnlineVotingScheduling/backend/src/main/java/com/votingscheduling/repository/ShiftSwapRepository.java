package com.votingscheduling.repository;

import com.votingscheduling.entity.ShiftSwap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShiftSwapRepository extends JpaRepository<ShiftSwap, Long> {
    List<ShiftSwap> findByOriginalUserId(Long userId);
    List<ShiftSwap> findBySwapUserId(Long userId);
    List<ShiftSwap> findBySlotId(Long slotId);
    List<ShiftSwap> findByStatus(String status);
    List<ShiftSwap> findByOriginalUserIdOrSwapUserId(Long originalUserId, Long swapUserId);
}
