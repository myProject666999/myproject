package com.oj.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.oj.entity.ProblemTag;

import java.util.List;

public interface ProblemTagService extends IService<ProblemTag> {
    List<ProblemTag> getByProblemId(Long problemId);
}
