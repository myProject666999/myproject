package com.oj.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.oj.entity.ContestProblem;
import com.oj.mapper.ContestProblemMapper;
import com.oj.service.ContestProblemService;
import org.springframework.stereotype.Service;

@Service
public class ContestProblemServiceImpl extends ServiceImpl<ContestProblemMapper, ContestProblem> implements ContestProblemService {
}
