package com.votingscheduling.repository;

import com.votingscheduling.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByTeamId(Long teamId);
    List<Schedule> findByTeamIdAndStatus(Long teamId, String status);
}
