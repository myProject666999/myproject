package com.oj.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.oj.entity.ProblemCase;

import java.util.List;

public interface ProblemCaseService extends IService<ProblemCase> {
    List<ProblemCase> getCasesByProblemId(Long problemId);
}
