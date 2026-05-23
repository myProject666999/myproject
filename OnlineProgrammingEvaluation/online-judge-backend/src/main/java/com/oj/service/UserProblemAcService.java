package com.oj.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.oj.entity.UserProblemAc;

import java.util.List;

public interface UserProblemAcService extends IService<UserProblemAc> {
    List<UserProblemAc> getByUserId(Long userId);
    boolean isAc(Long userId, Long problemId);
}
