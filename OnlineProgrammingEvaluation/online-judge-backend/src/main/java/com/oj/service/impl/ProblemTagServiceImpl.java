package com.oj.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.oj.entity.ProblemTag;
import com.oj.mapper.ProblemTagMapper;
import com.oj.service.ProblemTagService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProblemTagServiceImpl extends ServiceImpl<ProblemTagMapper, ProblemTag> implements ProblemTagService {

    @Override
    public List<ProblemTag> getByProblemId(Long problemId) {
        return this.list(new LambdaQueryWrapper<ProblemTag>().eq(ProblemTag::getProblemId, problemId));
    }
}
