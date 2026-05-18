package com.habit.tracking.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.habit.tracking.entity.CheckinRecord;
import lombok.Data;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface CheckinRecordRepository extends BaseMapper<CheckinRecord> {

    @Select("SELECT DISTINCT checkin_date FROM checkin_record WHERE user_id = #{userId} AND habit_id = #{habitId} AND checkin_date <= #{endDate} ORDER BY checkin_date DESC")
    List<LocalDate> findCheckinDatesDesc(@Param("userId") Long userId, @Param("habitId") Long habitId, @Param("endDate") LocalDate endDate);

    @Select("SELECT checkin_date FROM checkin_record WHERE user_id = #{userId} AND checkin_date BETWEEN #{startDate} AND #{endDate} ORDER BY checkin_date")
    List<LocalDate> findCheckinDatesByRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Select("SELECT DATE(c.checkin_time) as checkin_date, COUNT(DISTINCT c.habit_id) as habit_count " +
            "FROM checkin_record c WHERE c.user_id = #{userId} " +
            "AND c.checkin_date BETWEEN #{startDate} AND #{endDate} " +
            "GROUP BY DATE(c.checkin_time) ORDER BY checkin_date")
    List<CheckinCountVO> findDailyCheckinCount(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Data
    class CheckinCountVO {
        private LocalDate checkinDate;
        private Integer habitCount;
    }
}
