package com.exercise.diary.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.exercise.diary.entity.PrRecord;

import java.util.List;

public interface PrRecordService extends IService<PrRecord> {

    List<PrRecord> getPrList(Long userId);

}
