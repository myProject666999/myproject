package com.oj.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.oj.entity.ContestUser;
import com.oj.mapper.ContestUserMapper;
import com.oj.service.ContestUserService;
import org.springframework.stereotype.Service;

@Service
public class ContestUserServiceImpl extends ServiceImpl<ContestUserMapper, ContestUser> implements ContestUserService {
}
