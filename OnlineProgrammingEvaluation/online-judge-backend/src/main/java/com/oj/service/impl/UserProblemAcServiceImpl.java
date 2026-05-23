package com.oj.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.oj.entity.UserProblemAc;
import com.oj.mapper.UserProblemAcMapper;
import com.oj.service.UserProblemAcService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserProblemAcServiceImpl extends ServiceImpl<UserProblemAcMapper, UserProblemAc> implements UserProblemAcService {

    @Override
    public List<UserProblemAc> getByUserId(Long userId) {
        return this.list(new LambdaQueryWrapper<UserProblemAc>().eq(UserProblemAc::getUserId, userId));
    }

    @Override
    public boolean isAc(Long userId, Long problemId) {
        return this.count(new LambdaQueryWrapper<UserProblemAc>()
                .eq(UserProblemAc::getUserId, userId)
                .eq(UserProblemAc::getProblemId, problemId)) > 0;
    }
}
