package com.oj.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.oj.common.BusinessException;
import com.oj.common.Constants;
import com.oj.common.ResultCode;
import com.oj.entity.*;
import com.oj.mapper.ProblemMapper;
import com.oj.service.*;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProblemServiceImpl extends ServiceImpl<ProblemMapper, Problem> implements ProblemService {

    @Resource
    private ProblemCaseService problemCaseService;

    @Resource
    private ProblemTagService problemTagService;

    @Resource
    private TagService tagService;

    @Resource
    private UserProblemAcService userProblemAcService;

    @Override
    public IPage<Problem> getProblemPage(int page, int size, String keyword, Integer difficulty, Integer status, Long userId) {
        Page<Problem> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Problem> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(Problem::getTitle, keyword);
        }
        if (difficulty != null) {
            wrapper.eq(Problem::getDifficulty, difficulty);
        }
        if (status != null) {
            wrapper.eq(Problem::getStatus, status);
        } else {
            wrapper.eq(Problem::getStatus, Constants.ProblemStatus.PUBLIC);
        }
        wrapper.orderByDesc(Problem::getId);
        IPage<Problem> result = this.page(pageParam, wrapper);
        if (userId != null && !CollectionUtils.isEmpty(result.getRecords())) {
            List<Long> problemIds = result.getRecords().stream().map(Problem::getId).collect(Collectors.toList());
            List<UserProblemAc> acList = userProblemAcService.list(
                    new LambdaQueryWrapper<UserProblemAc>()
                            .in(UserProblemAc::getProblemId, problemIds)
                            .eq(UserProblemAc::getUserId, userId));
            for (Problem p : result.getRecords()) {
                boolean ac = acList.stream().anyMatch(a -> a.getProblemId().equals(p.getId()));
                p.setAcStatus(ac ? 1 : 0);
            }
        }
        return result;
    }

    @Override
    public Problem getProblemDetail(Long problemId, Long userId) {
        Problem problem = this.getById(problemId);
        if (problem == null) {
            throw new BusinessException(ResultCode.PROBLEM_NOT_FOUND);
        }
        List<ProblemCase> cases = problemCaseService.list(
                new LambdaQueryWrapper<ProblemCase>().eq(ProblemCase::getProblemId, problemId)
                        .orderByAsc(ProblemCase::getId));
        problem.setCases(cases);
        List<ProblemTag> problemTags = problemTagService.list(
                new LambdaQueryWrapper<ProblemTag>().eq(ProblemTag::getProblemId, problemId));
        if (!CollectionUtils.isEmpty(problemTags)) {
            List<Long> tagIds = problemTags.stream().map(ProblemTag::getTagId).collect(Collectors.toList());
            problem.setTags(tagService.listByIds(tagIds));
        }
        if (userId != null) {
            UserProblemAc ac = userProblemAcService.getOne(
                    new LambdaQueryWrapper<UserProblemAc>()
                            .eq(UserProblemAc::getProblemId, problemId)
                            .eq(UserProblemAc::getUserId, userId), false);
            problem.setAcStatus(ac != null ? 1 : 0);
        }
        return problem;
    }

    @Override
    @Transactional
    public Problem createProblem(Problem problem) {
        problem.setSubmitCount(0);
        problem.setAcceptedCount(0);
        if (problem.getStatus() == null) problem.setStatus(Constants.ProblemStatus.PUBLIC);
        if (problem.getTimeLimit() == null) problem.setTimeLimit(1000);
        if (problem.getMemoryLimit() == null) problem.setMemoryLimit(256);
        this.save(problem);
        saveProblemTags(problem);
        saveProblemCases(problem);
        return problem;
    }

    @Override
    @Transactional
    public Problem updateProblem(Problem problem) {
        Problem dbProblem = this.getById(problem.getId());
        if (dbProblem == null) {
            throw new BusinessException(ResultCode.PROBLEM_NOT_FOUND);
        }
        this.updateById(problem);
        if (problem.getTags() != null) {
            problemTagService.remove(new LambdaQueryWrapper<ProblemTag>().eq(ProblemTag::getProblemId, problem.getId()));
            saveProblemTags(problem);
        }
        if (problem.getCases() != null) {
            problemCaseService.remove(new LambdaQueryWrapper<ProblemCase>().eq(ProblemCase::getProblemId, problem.getId()));
            saveProblemCases(problem);
        }
        return problem;
    }

    @Override
    @Transactional
    public void deleteProblem(Long problemId) {
        this.removeById(problemId);
        problemCaseService.remove(new LambdaQueryWrapper<ProblemCase>().eq(ProblemCase::getProblemId, problemId));
        problemTagService.remove(new LambdaQueryWrapper<ProblemTag>().eq(ProblemTag::getProblemId, problemId));
    }

    @Override
    public List<Problem> getProblemListByIds(List<Long> ids) {
        if (CollectionUtils.isEmpty(ids)) return new ArrayList<>();
        return this.listByIds(ids);
    }

    @Override
    public void updateSubmitStats(Long problemId, boolean accepted) {
        Problem problem = this.getById(problemId);
        if (problem != null) {
            problem.setSubmitCount(problem.getSubmitCount() + 1);
            if (accepted) {
                problem.setAcceptedCount(problem.getAcceptedCount() + 1);
            }
            this.updateById(problem);
        }
    }

    private void saveProblemTags(Problem problem) {
        if (!CollectionUtils.isEmpty(problem.getTags())) {
            for (Tag tag : problem.getTags()) {
                ProblemTag pt = new ProblemTag();
                pt.setProblemId(problem.getId());
                pt.setTagId(tag.getId());
                problemTagService.save(pt);
            }
        }
    }

    private void saveProblemCases(Problem problem) {
        if (!CollectionUtils.isEmpty(problem.getCases())) {
            for (ProblemCase pc : problem.getCases()) {
                pc.setId(null);
                pc.setProblemId(problem.getId());
                problemCaseService.save(pc);
            }
        }
    }
}
