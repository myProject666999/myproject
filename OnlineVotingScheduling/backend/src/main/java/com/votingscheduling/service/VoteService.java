package com.votingscheduling.service;

import com.votingscheduling.entity.Vote;
import com.votingscheduling.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VoteService {

    private final VoteRepository voteRepository;

    public List<Vote> findByScheduleId(Long scheduleId) {
        return voteRepository.findByScheduleId(scheduleId);
    }

    public long countApprove(Long scheduleId) {
        return voteRepository.countByScheduleIdAndVoteType(scheduleId, "APPROVE");
    }

    public long countReject(Long scheduleId) {
        return voteRepository.countByScheduleIdAndVoteType(scheduleId, "REJECT");
    }

    public long countAbstain(Long scheduleId) {
        return voteRepository.countByScheduleIdAndVoteType(scheduleId, "ABSTAIN");
    }

    @Transactional
    public Vote vote(Long scheduleId, Long userId, String voteType, String comment) {
        if (voteRepository.existsByScheduleIdAndUserId(scheduleId, userId)) {
            Vote existing = voteRepository.findByScheduleIdAndUserId(scheduleId, userId)
                    .orElseThrow(() -> new RuntimeException("Vote does not exist"));
            existing.setVoteType(voteType);
            existing.setComment(comment);
            return voteRepository.save(existing);
        }

        Vote vote = Vote.builder()
                .scheduleId(scheduleId)
                .userId(userId)
                .voteType(voteType)
                .comment(comment)
                .build();
        return voteRepository.save(vote);
    }
}