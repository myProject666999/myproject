package com.exercise.diary.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.exercise.diary.entity.PrRecord;
import com.exercise.diary.mapper.PrRecordMapper;
import com.exercise.diary.service.PrRecordService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrRecordServiceImpl extends ServiceImpl<PrRecordMapper, PrRecord> implements PrRecordService {

    @Override
    public List<PrRecord> getPrList(Long userId) {
        return baseMapper.selectByUserId(userId);
    }

}
