package com.oj.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.oj.common.BusinessException;
import com.oj.common.Constants;
import com.oj.common.ResultCode;
import com.oj.entity.*;
import com.oj.mapper.ContestMapper;
import com.oj.service.*;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContestServiceImpl extends ServiceImpl<ContestMapper, Contest> implements ContestService {

    @Resource
    private ContestProblemService contestProblemService;

    @Resource
    private ContestUserService contestUserService;

    @Resource
    private ProblemService problemService;

    @Resource
    private UserService userService;

    @Resource
    private SubmissionService submissionService;

    @Override
    public IPage<Contest> getContestPage(int page, int size, String keyword, Integer status) {
        Page<Contest> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Contest> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(Contest::getTitle, keyword);
        }
        if (status != null) {
            wrapper.eq(Contest::getStatus, status);
        }
        wrapper.orderByDesc(Contest::getStartTime);
        return this.page(pageParam, wrapper);
    }

    @Override
    public Contest getContestDetail(Long contestId, Long userId) {
        Contest contest = this.getById(contestId);
        if (contest == null) {
            throw new BusinessException(ResultCode.CONTEST_NOT_FOUND);
        }
        List<ContestProblem> contestProblems = contestProblemService.list(
                new LambdaQueryWrapper<ContestProblem>()
                        .eq(ContestProblem::getContestId, contestId)
                        .orderByAsc(ContestProblem::getOrderIndex));
        if (!CollectionUtils.isEmpty(contestProblems)) {
            List<Long> problemIds = contestProblems.stream().map(ContestProblem::getProblemId).collect(Collectors.toList());
            contest.setProblems(problemService.getProblemListByIds(problemIds));
        }
        contest.setHasPassword(StringUtils.hasText(contest.getPassword()));
        if (userId != null) {
            ContestUser contestUser = contestUserService.getOne(
                    new LambdaQueryWrapper<ContestUser>()
                            .eq(ContestUser::getContestId, contestId)
                            .eq(ContestUser::getUserId, userId), false);
            if (contestUser != null) {
                contest.setHasPassword(false);
            }
        }
        contest.setPassword(null);
        return contest;
    }

    @Override
    @Transactional
    public Contest createContest(Contest contest) {
        if (contest.getStatus() == null) contest.setStatus(Constants.ContestStatus.NOT_STARTED);
        this.save(contest);
        if (!CollectionUtils.isEmpty(contest.getProblems())) {
            int index = 1;
            for (Problem problem : contest.getProblems()) {
                ContestProblem cp = new ContestProblem();
                cp.setContestId(contest.getId());
                cp.setProblemId(problem.getId());
                cp.setOrderIndex(index++);
                contestProblemService.save(cp);
            }
        }
        return contest;
    }

    @Override
    @Transactional
    public Contest updateContest(Contest contest) {
        Contest dbContest = this.getById(contest.getId());
        if (dbContest == null) {
            throw new BusinessException(ResultCode.CONTEST_NOT_FOUND);
        }
        this.updateById(contest);
        if (contest.getProblems() != null) {
            contestProblemService.remove(new LambdaQueryWrapper<ContestProblem>().eq(ContestProblem::getContestId, contest.getId()));
            int index = 1;
            for (Problem problem : contest.getProblems()) {
                ContestProblem cp = new ContestProblem();
                cp.setContestId(contest.getId());
                cp.setProblemId(problem.getId());
                cp.setOrderIndex(index++);
                contestProblemService.save(cp);
            }
        }
        return contest;
    }

    @Override
    @Transactional
    public void deleteContest(Long contestId) {
        this.removeById(contestId);
        contestProblemService.remove(new LambdaQueryWrapper<ContestProblem>().eq(ContestProblem::getContestId, contestId));
        contestUserService.remove(new LambdaQueryWrapper<ContestUser>().eq(ContestUser::getContestId, contestId));
    }

    @Override
    public void joinContest(Long contestId, Long userId, String password) {
        Contest contest = this.getById(contestId);
        if (contest == null) {
            throw new BusinessException(ResultCode.CONTEST_NOT_FOUND);
        }
        if (StringUtils.hasText(contest.getPassword()) && !contest.getPassword().equals(password)) {
            throw new BusinessException("竞赛密码错误");
        }
        ContestUser existing = contestUserService.getOne(
                new LambdaQueryWrapper<ContestUser>()
                        .eq(ContestUser::getContestId, contestId)
                        .eq(ContestUser::getUserId, userId), false);
        if (existing != null) return;
        ContestUser cu = new ContestUser();
        cu.setContestId(contestId);
        cu.setUserId(userId);
        cu.setSolvedCount(0);
        cu.setPenalty(0);
        contestUserService.save(cu);
    }

    @Override
    public List<ContestUser> getContestRank(Long contestId) {
        List<ContestUser> users = contestUserService.list(
                new LambdaQueryWrapper<ContestUser>().eq(ContestUser::getContestId, contestId));
        for (ContestUser cu : users) {
            User user = userService.getById(cu.getUserId());
            if (user != null) {
                user.setPassword(null);
                cu.setUser(user);
            }
        }
        users.sort(Comparator.comparing(ContestUser::getSolvedCount).reversed()
                .thenComparing(ContestUser::getPenalty));
        int rank = 1;
        for (ContestUser cu : users) {
            cu.setRank(rank++);
        }
        return users;
    }

    @Override
    public void updateContestStatus() {
        LocalDateTime now = LocalDateTime.now();
        List<Contest> contests = this.list();
        for (Contest contest : contests) {
            Integer newStatus = null;
            if (now.isBefore(contest.getStartTime())) {
                newStatus = Constants.ContestStatus.NOT_STARTED;
            } else if (now.isAfter(contest.getEndTime())) {
                newStatus = Constants.ContestStatus.ENDED;
            } else {
                newStatus = Constants.ContestStatus.RUNNING;
            }
            if (!contest.getStatus().equals(newStatus)) {
                contest.setStatus(newStatus);
                this.updateById(contest);
            }
        }
    }
}
