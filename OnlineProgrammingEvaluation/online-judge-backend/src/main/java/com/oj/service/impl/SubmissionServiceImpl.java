package com.oj.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.oj.common.BusinessException;
import com.oj.common.Constants;
import com.oj.common.ResultCode;
import com.oj.dto.SubmitDTO;
import com.oj.entity.Problem;
import com.oj.entity.Submission;
import com.oj.entity.User;
import com.oj.entity.UserProblemAc;
import com.oj.mapper.SubmissionMapper;
import com.oj.service.*;
import com.oj.util.RedisUtil;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;

@Service
public class SubmissionServiceImpl extends ServiceImpl<SubmissionMapper, Submission> implements SubmissionService {

    @Resource
    private ProblemService problemService;

    @Resource
    private UserService userService;

    @Resource
    private UserProblemAcService userProblemAcService;

    @Resource
    private RedisUtil redisUtil;

    @Override
    @Transactional
    public Submission submit(SubmitDTO submitDTO, Long userId) {
        Problem problem = problemService.getById(submitDTO.getProblemId());
        if (problem == null) {
            throw new BusinessException(ResultCode.PROBLEM_NOT_FOUND);
        }
        if (!Arrays.asList(Constants.Language.SUPPORTED).contains(submitDTO.getLanguage())) {
            throw new BusinessException(ResultCode.LANGUAGE_NOT_SUPPORTED);
        }
        if (submitDTO.getCode().length() > 65536) {
            throw new BusinessException(ResultCode.CODE_TOO_LONG);
        }
        Submission submission = new Submission();
        submission.setUserId(userId);
        submission.setProblemId(submitDTO.getProblemId());
        submission.setContestId(submitDTO.getContestId());
        submission.setLanguage(submitDTO.getLanguage());
        submission.setCode(submitDTO.getCode());
        submission.setStatus(Constants.SubmissionStatus.PENDING);
        this.save(submission);
        User user = userService.getById(userId);
        if (user != null) {
            user.setSubmitCount(user.getSubmitCount() + 1);
            userService.updateById(user);
        }
        problemService.updateSubmitStats(submitDTO.getProblemId(), false);
        redisUtil.lPush(Constants.RedisKey.SUBMIT_QUEUE, submission.getId());
        return submission;
    }

    @Override
    public IPage<Submission> getSubmissionPage(int page, int size, Long userId, Long problemId, Long contestId, Integer status, String language) {
        Page<Submission> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Submission> wrapper = new LambdaQueryWrapper<>();
        if (userId != null) wrapper.eq(Submission::getUserId, userId);
        if (problemId != null) wrapper.eq(Submission::getProblemId, problemId);
        if (contestId != null) wrapper.eq(Submission::getContestId, contestId);
        if (status != null) wrapper.eq(Submission::getStatus, status);
        if (language != null && !language.isEmpty()) wrapper.eq(Submission::getLanguage, language);
        wrapper.orderByDesc(Submission::getId);
        IPage<Submission> result = this.page(pageParam, wrapper);
        for (Submission s : result.getRecords()) {
            fillSubmissionInfo(s);
        }
        return result;
    }

    @Override
    public Submission getSubmissionDetail(Long id, Long userId) {
        Submission submission = this.getById(id);
        if (submission == null) {
            throw new BusinessException(ResultCode.SUBMISSION_NOT_FOUND);
        }
        if (userId != null && !submission.getUserId().equals(userId)) {
            User user = userService.getById(userId);
            if (user == null || user.getRole() != Constants.UserRole.ADMIN) {
                submission.setCode(null);
            }
        }
        fillSubmissionInfo(submission);
        return submission;
    }

    @Override
    @Transactional
    public void updateSubmissionResult(Submission submission) {
        Submission dbSubmission = this.getById(submission.getId());
        if (dbSubmission == null) return;
        dbSubmission.setStatus(submission.getStatus());
        dbSubmission.setScore(submission.getScore());
        dbSubmission.setTimeUsed(submission.getTimeUsed());
        dbSubmission.setMemoryUsed(submission.getMemoryUsed());
        dbSubmission.setCaseCount(submission.getCaseCount());
        dbSubmission.setTotalCase(submission.getTotalCase());
        dbSubmission.setErrorMsg(submission.getErrorMsg());
        this.updateById(dbSubmission);
        if (submission.getStatus() == Constants.SubmissionStatus.ACCEPTED) {
            UserProblemAc ac = userProblemAcService.getOne(
                    new LambdaQueryWrapper<UserProblemAc>()
                            .eq(UserProblemAc::getUserId, dbSubmission.getUserId())
                            .eq(UserProblemAc::getProblemId, dbSubmission.getProblemId()), false);
            if (ac == null) {
                UserProblemAc newAc = new UserProblemAc();
                newAc.setUserId(dbSubmission.getUserId());
                newAc.setProblemId(dbSubmission.getProblemId());
                newAc.setSubmissionId(dbSubmission.getId());
                userProblemAcService.save(newAc);
                User user = userService.getById(dbSubmission.getUserId());
                if (user != null) {
                    user.setSolvedCount(user.getSolvedCount() + 1);
                    userService.updateById(user);
                }
            }
        }
        redisUtil.convertAndSend(Constants.RedisKey.RESULT_TOPIC, dbSubmission.getId());
    }

    private void fillSubmissionInfo(Submission submission) {
        User user = userService.getById(submission.getUserId());
        if (user != null) {
            user.setPassword(null);
            submission.setUser(user);
        }
        Problem problem = problemService.getById(submission.getProblemId());
        if (problem != null) {
            problem.setCases(null);
            problem.setTags(null);
            submission.setProblem(problem);
        }
        submission.setStatusText(getStatusText(submission.getStatus()));
    }

    private String getStatusText(Integer status) {
        if (status == null) return "Unknown";
        return switch (status) {
            case 0 -> Constants.SubmissionStatusText.PENDING;
            case 1 -> Constants.SubmissionStatusText.JUDGING;
            case 2 -> Constants.SubmissionStatusText.ACCEPTED;
            case 3 -> Constants.SubmissionStatusText.WRONG_ANSWER;
            case 4 -> Constants.SubmissionStatusText.TIME_LIMIT_EXCEEDED;
            case 5 -> Constants.SubmissionStatusText.MEMORY_LIMIT_EXCEEDED;
            case 6 -> Constants.SubmissionStatusText.RUNTIME_ERROR;
            case 7 -> Constants.SubmissionStatusText.COMPILE_ERROR;
            case 8 -> Constants.SubmissionStatusText.SYSTEM_ERROR;
            default -> "Unknown";
        };
    }
}
