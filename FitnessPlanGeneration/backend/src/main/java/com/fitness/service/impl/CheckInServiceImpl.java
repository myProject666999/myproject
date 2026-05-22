package com.fitness.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fitness.entity.CheckInRecord;
import com.fitness.entity.DailyPlan;
import com.fitness.entity.AdjustmentSuggestion;
import com.fitness.mapper.CheckInRecordMapper;
import com.fitness.mapper.DailyPlanMapper;
import com.fitness.mapper.AdjustmentSuggestionMapper;
import com.fitness.service.CheckInService;
import com.fitness.dto.CheckInDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class CheckInServiceImpl implements CheckInService {

    @Autowired
    private CheckInRecordMapper checkInRecordMapper;

    @Autowired
    private DailyPlanMapper dailyPlanMapper;

    @Autowired
    private AdjustmentSuggestionMapper adjustmentSuggestionMapper;

    @Override
    public CheckInRecord checkIn(CheckInDTO dto) {
        QueryWrapper<CheckInRecord> wrapper = new QueryWrapper<>();
        wrapper.eq("daily_plan_id", dto.getDailyPlanId());
        CheckInRecord existing = checkInRecordMapper.selectOne(wrapper);
        if (existing != null) {
            existing.setWeight(dto.getWeight());
            existing.setBodyFat(dto.getBodyFat());
            existing.setMood(dto.getMood());
            existing.setEnergyLevel(dto.getEnergyLevel());
            existing.setActualDuration(dto.getActualDuration());
            existing.setActualCalories(dto.getActualCalories());
            existing.setNotes(dto.getNotes());
            checkInRecordMapper.updateById(existing);
            DailyPlan dp = dailyPlanMapper.selectById(dto.getDailyPlanId());
            if (dp != null) {
                dp.setStatus(2);
                dailyPlanMapper.updateById(dp);
            }
            return existing;
        }

        CheckInRecord record = new CheckInRecord();
        record.setUserId(dto.getUserId());
        record.setDailyPlanId(dto.getDailyPlanId());
        record.setCheckInDate(LocalDate.now());
        record.setWeight(dto.getWeight());
        record.setBodyFat(dto.getBodyFat());
        record.setMood(dto.getMood());
        record.setEnergyLevel(dto.getEnergyLevel());
        record.setActualDuration(dto.getActualDuration());
        record.setActualCalories(dto.getActualCalories());
        record.setNotes(dto.getNotes());
        checkInRecordMapper.insert(record);

        DailyPlan dp = dailyPlanMapper.selectById(dto.getDailyPlanId());
        if (dp != null) {
            dp.setStatus(2);
            dailyPlanMapper.updateById(dp);
        }

        return record;
    }

    @Override
    public List<CheckInRecord> getByUserId(Long userId) {
        QueryWrapper<CheckInRecord> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).orderByDesc("check_in_date");
        return checkInRecordMapper.selectList(wrapper);
    }

    @Override
    public CheckInRecord getByDailyPlanId(Long dailyPlanId) {
        QueryWrapper<CheckInRecord> wrapper = new QueryWrapper<>();
        wrapper.eq("daily_plan_id", dailyPlanId);
        return checkInRecordMapper.selectOne(wrapper);
    }

    @Override
    public List<AdjustmentSuggestion> generateSuggestions(Long userId, Long dailyPlanId) {
        List<AdjustmentSuggestion> suggestions = new ArrayList<>();

        CheckInRecord checkIn = getByDailyPlanId(dailyPlanId);
        if (checkIn == null) {
            return suggestions;
        }

        DailyPlan dp = dailyPlanMapper.selectById(dailyPlanId);

        if (checkIn.getMood() != null && checkIn.getMood() == 1) {
            AdjustmentSuggestion s = new AdjustmentSuggestion();
            s.setUserId(userId);
            s.setDailyPlanId(dailyPlanId);
            s.setSuggestionType("REST");
            s.setSuggestionContent("您今天心情不佳，建议适当减少训练强度，进行一些低强度有氧运动或瑜伽放松。");
            s.setReason("心情评分较低，建议降低负荷");
            s.setIsApplied(0);
            adjustmentSuggestionMapper.insert(s);
            suggestions.add(s);
        }

        if (checkIn.getEnergyLevel() != null && checkIn.getEnergyLevel() == 1) {
            AdjustmentSuggestion s = new AdjustmentSuggestion();
            s.setUserId(userId);
            s.setDailyPlanId(dailyPlanId);
            s.setSuggestionType("LOAD");
            s.setSuggestionContent("您今天精力不足，建议将训练强度降低30%，减少组数或次数，同时保证充足的休息。");
            s.setReason("精力评分较低，建议降低训练负荷");
            s.setIsApplied(0);
            adjustmentSuggestionMapper.insert(s);
            suggestions.add(s);
        }

        if (checkIn.getActualDuration() != null && dp != null
                && dp.getTotalDuration() != null
                && checkIn.getActualDuration() < dp.getTotalDuration() * 0.6) {
            AdjustmentSuggestion s = new AdjustmentSuggestion();
            s.setUserId(userId);
            s.setDailyPlanId(dailyPlanId);
            s.setSuggestionType("EXERCISE");
            s.setSuggestionContent("实际训练时长明显低于计划，建议下一次训练减少动作数量，或调整为更适合当前状态的训练内容。");
            s.setReason("实际训练时长不足计划的60%");
            s.setIsApplied(0);
            adjustmentSuggestionMapper.insert(s);
            suggestions.add(s);
        }

        if (checkIn.getActualCalories() != null && dp != null
                && dp.getTotalCalories() != null
                && checkIn.getActualCalories().compareTo(dp.getTotalCalories().multiply(new BigDecimal("0.5"))) < 0) {
            AdjustmentSuggestion s = new AdjustmentSuggestion();
            s.setUserId(userId);
            s.setDailyPlanId(dailyPlanId);
            s.setSuggestionType("NUTRITION");
            s.setSuggestionContent("训练消耗偏低，建议注意饮食调整。增肌目标请确保蛋白质摄入充足，减脂目标请控制总热量摄入。");
            s.setReason("实际热量消耗不足预期的50%");
            s.setIsApplied(0);
            adjustmentSuggestionMapper.insert(s);
            suggestions.add(s);
        }

        return suggestions;
    }
}
