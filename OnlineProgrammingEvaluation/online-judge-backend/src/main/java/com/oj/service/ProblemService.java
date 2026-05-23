package com.oj.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.oj.entity.Problem;

import java.util.List;

public interface ProblemService extends IService<Problem> {
    IPage<Problem> getProblemPage(int page, int size, String keyword, Integer difficulty, Integer status, Long userId);
    Problem getProblemDetail(Long problemId, Long userId);
    Problem createProblem(Problem problem);
    Problem updateProblem(Problem problem);
    void deleteProblem(Long problemId);
    List<Problem> getProblemListByIds(List<Long> ids);
    void updateSubmitStats(Long problemId, boolean accepted);
}
