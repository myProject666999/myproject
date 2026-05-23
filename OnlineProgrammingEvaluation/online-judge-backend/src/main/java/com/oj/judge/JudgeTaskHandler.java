package com.oj.judge;

import com.oj.common.Constants;
import com.oj.entity.Problem;
import com.oj.entity.ProblemCase;
import com.oj.entity.Submission;
import com.oj.service.ProblemCaseService;
import com.oj.service.ProblemService;
import com.oj.service.SubmissionService;
import com.oj.util.RedisUtil;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
public class JudgeTaskHandler {

    @Resource
    private RedisUtil redisUtil;

    @Resource
    private SubmissionService submissionService;

    @Resource
    private ProblemService problemService;

    @Resource
    private ProblemCaseService problemCaseService;

    @Resource
    private JudgeSandbox judgeSandbox;

    @Async("judgeTaskExecutor")
    public void handleSubmission() {
        while (true) {
            try {
                Object obj = redisUtil.rPop(Constants.RedisKey.SUBMIT_QUEUE, 5, TimeUnit.SECONDS);
                if (obj != null) {
                    Long submissionId = Long.parseLong(obj.toString());
                    processSubmission(submissionId);
                }
            } catch (Exception e) {
                log.error("Judge task error", e);
                try { Thread.sleep(1000); } catch (InterruptedException ignored) {}
            }
        }
    }

    private void processSubmission(Long submissionId) {
        Submission submission = submissionService.getById(submissionId);
        if (submission == null) return;
        submission.setStatus(Constants.SubmissionStatus.JUDGING);
        submissionService.updateById(submission);
        try {
            Problem problem = problemService.getById(submission.getProblemId());
            if (problem == null) {
                finishSubmission(submissionId, Constants.SubmissionStatus.SYSTEM_ERROR, 0, 0, "题目不存在", 0, 0);
                return;
            }
            List<ProblemCase> cases = problemCaseService.getCasesByProblemId(problem.getId());
            if (cases.isEmpty()) {
                finishSubmission(submissionId, Constants.SubmissionStatus.SYSTEM_ERROR, 0, 0, "无测试用例", 0, 0);
                return;
            }
            JudgeResult result = judgeSandbox.judge(submission, problem, cases);
            finishSubmission(submissionId, result.getStatus(), result.getTimeUsed(), result.getMemoryUsed(),
                    result.getErrorMsg(), result.getPassedCases(), cases.size());
        } catch (Exception e) {
            log.error("Judge error for submission: {}", submissionId, e);
            finishSubmission(submissionId, Constants.SubmissionStatus.SYSTEM_ERROR, 0, 0,
                    "判题异常: " + e.getMessage(), 0, 0);
        }
    }

    private void finishSubmission(Long submissionId, int status, int timeUsed, int memoryUsed,
                                 String errorMsg, int caseCount, int totalCase) {
        Submission result = new Submission();
        result.setId(submissionId);
        result.setStatus(status);
        result.setTimeUsed(timeUsed);
        result.setMemoryUsed(memoryUsed);
        result.setErrorMsg(errorMsg);
        result.setCaseCount(caseCount);
        result.setTotalCase(totalCase);
        if (status == Constants.SubmissionStatus.ACCEPTED) {
            result.setScore(100);
        } else if (caseCount > 0 && totalCase > 0) {
            result.setScore((int) Math.round((double) caseCount / totalCase * 100));
        } else {
            result.setScore(0);
        }
        submissionService.updateSubmissionResult(result);
    }
}
