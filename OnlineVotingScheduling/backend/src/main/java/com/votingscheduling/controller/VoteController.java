package com.votingscheduling.controller;

import com.votingscheduling.common.Result;
import com.votingscheduling.entity.Vote;
import com.votingscheduling.security.JwtTokenProvider;
import com.votingscheduling.service.VoteService;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/votes")
@RequiredArgsConstructor
public class VoteController {

    private final VoteService voteService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/schedule/{scheduleId}")
    public Result<List<Vote>> getBySchedule(@PathVariable Long scheduleId) {
        return Result.success(voteService.findByScheduleId(scheduleId));
    }

    @PostMapping("/schedule/{scheduleId}")
    public Result<Vote> vote(@PathVariable Long scheduleId,
                             @RequestParam String voteType,
                             @RequestParam(required = false) String comment,
                             HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        return Result.success(voteService.vote(scheduleId, userId, voteType, comment));
    }

    @GetMapping("/schedule/{scheduleId}/count")
    public Result<VoteCount> getVoteCount(@PathVariable Long scheduleId) {
        VoteCount count = new VoteCount(
                voteService.countApprove(scheduleId),
                voteService.countReject(scheduleId),
                voteService.countAbstain(scheduleId)
        );
        return Result.success(count);
    }

    public static class VoteCount {
        public long approve;
        public long reject;
        public long abstain;

        public VoteCount(long approve, long reject, long abstain) {
            this.approve = approve;
            this.reject = reject;
            this.abstain = abstain;
        }
    }
}
