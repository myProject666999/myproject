package com.nutrition.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.nutrition.entity.MealRecord;
import com.nutrition.vo.DailySummaryVO;
import com.nutrition.vo.MealRecordVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface MealRecordMapper extends BaseMapper<MealRecord> {

    List<MealRecordVO> selectMealRecordsWithFood(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    List<DailySummaryVO> selectDailySummary(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
