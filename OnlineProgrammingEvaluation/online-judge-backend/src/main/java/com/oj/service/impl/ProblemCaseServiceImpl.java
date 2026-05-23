package com.oj.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.oj.entity.ProblemCase;
import com.oj.mapper.ProblemCaseMapper;
import com.oj.service.ProblemCaseService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProblemCaseServiceImpl extends ServiceImpl<ProblemCaseMapper, ProblemCase> implements ProblemCaseService {

    @Override
    public List<ProblemCase> getCasesByProblemId(Long problemId) {
        return this.list(new LambdaQueryWrapper<ProblemCase>()
                .eq(ProblemCase::getProblemId, problemId)
                .orderByAsc(ProblemCase::getId));
    }
}
