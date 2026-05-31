package com.votingscheduling.repository;

import com.votingscheduling.entity.AvailableTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvailableTimeRepository extends JpaRepository<AvailableTime, Long> {
    List<AvailableTime> findByTeamIdAndUserId(Long teamId, Long userId);
    List<AvailableTime> findByTeamId(Long teamId);
    List<AvailableTime> findByTeamIdAndWeekDay(Long teamId, Integer weekDay);
    void deleteByTeamIdAndUserId(Long teamId, Long userId);
}
