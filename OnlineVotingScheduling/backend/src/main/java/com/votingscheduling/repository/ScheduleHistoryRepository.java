package com.votingscheduling.repository;

import com.votingscheduling.entity.ScheduleHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleHistoryRepository extends JpaRepository<ScheduleHistory, Long> {
    List<ScheduleHistory> findBySlotId(Long slotId);
    List<ScheduleHistory> findByActionUserId(Long actionUserId);
}
