package com.sleeprecord.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.sleeprecord.entity.SleepRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Mapper
public interface SleepRecordMapper extends BaseMapper<SleepRecord> {

    @Select("SELECT DATE_FORMAT(sleep_date, '%Y-%m') as month, " +
            "COUNT(*) as record_count, " +
            "ROUND(AVG(quality_score), 1) as avg_quality, " +
            "ROUND(AVG(TIMESTAMPDIFF(MINUTE, sleep_time, wake_time)) / 60.0, 1) as avg_duration, " +
            "ROUND(AVG(deep_sleep), 1) as avg_deep_sleep, " +
            "ROUND(AVG(light_sleep), 1) as avg_light_sleep " +
            "FROM sleep_record " +
            "WHERE sleep_date BETWEEN #{startDate} AND #{endDate} " +
            "GROUP BY DATE_FORMAT(sleep_date, '%Y-%m') " +
            "ORDER BY month")
    List<Map<String, Object>> getMonthlyReport(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Select("SELECT sleep_date, quality_score, " +
            "ROUND(TIMESTAMPDIFF(MINUTE, sleep_time, wake_time) / 60.0, 1) as duration, " +
            "deep_sleep, light_sleep, " +
            "sleep_time, wake_time " +
            "FROM sleep_record " +
            "WHERE sleep_date BETWEEN #{startDate} AND #{endDate} " +
            "ORDER BY sleep_date")
    List<Map<String, Object>> getDailyRecords(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Select("SELECT " +
            "COUNT(*) as total_days, " +
            "ROUND(AVG(quality_score), 1) as avg_quality, " +
            "ROUND(AVG(TIMESTAMPDIFF(MINUTE, sleep_time, wake_time)) / 60.0, 1) as avg_duration, " +
            "ROUND(AVG(deep_sleep), 1) as avg_deep_sleep, " +
            "ROUND(AVG(light_sleep), 1) as avg_light_sleep, " +
            "MIN(TIMESTAMPDIFF(MINUTE, sleep_time, wake_time)) / 60.0 as min_duration, " +
            "MAX(TIMESTAMPDIFF(MINUTE, sleep_time, wake_time)) / 60.0 as max_duration " +
            "FROM sleep_record " +
            "WHERE sleep_date BETWEEN #{startDate} AND #{endDate}")
    Map<String, Object> getSummary(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Select("SELECT " +
            "COUNT(CASE WHEN HOUR(sleep_time) BETWEEN 22 AND 23 OR HOUR(sleep_time) = 0 THEN 1 END) as early_sleep_count, " +
            "COUNT(*) as total_count, " +
            "ROUND(STDDEV(HOUR(sleep_time) * 60 + MINUTE(sleep_time)), 0) as sleep_time_std, " +
            "ROUND(STDDEV(HOUR(wake_time) * 60 + MINUTE(wake_time)), 0) as wake_time_std " +
            "FROM sleep_record " +
            "WHERE sleep_date BETWEEN #{startDate} AND #{endDate}")
    Map<String, Object> getRegularityStats(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
