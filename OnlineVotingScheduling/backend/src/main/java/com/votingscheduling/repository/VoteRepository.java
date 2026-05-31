package com.votingscheduling.repository;

import com.votingscheduling.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    List<Vote> findByScheduleId(Long scheduleId);
    Optional<Vote> findByScheduleIdAndUserId(Long scheduleId, Long userId);
    boolean existsByScheduleIdAndUserId(Long scheduleId, Long userId);
    long countByScheduleIdAndVoteType(Long scheduleId, String voteType);
}
