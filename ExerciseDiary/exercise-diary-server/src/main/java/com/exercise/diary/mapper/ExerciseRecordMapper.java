package com.exercise.diary.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.exercise.diary.entity.ExerciseRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Mapper
public interface ExerciseRecordMapper extends BaseMapper<ExerciseRecord> {

    @Select("SELECT er.*, et.name as exercise_type_name, et.category, et.met, et.icon " +
            "FROM exercise_record er " +
            "LEFT JOIN exercise_type et ON er.exercise_type_id = et.id " +
            "WHERE er.user_id = #{userId} AND er.exercise_date = #{date} " +
            "ORDER BY er.create_time DESC")
    List<ExerciseRecord> selectByDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Select("SELECT er.*, et.name as exercise_type_name, et.category, et.met, et.icon " +
            "FROM exercise_record er " +
            "LEFT JOIN exercise_type et ON er.exercise_type_id = et.id " +
            "WHERE er.user_id = #{userId} " +
            "ORDER BY er.exercise_date DESC, er.create_time DESC " +
            "LIMIT #{offset}, #{limit}")
    List<ExerciseRecord> selectHistory(@Param("userId") Long userId, @Param("offset") Integer offset, @Param("limit") Integer limit);

    @Select("SELECT COALESCE(SUM(er.calories), 0) " +
            "FROM exercise_record er " +
            "WHERE er.user_id = #{userId} AND er.exercise_date BETWEEN #{startDate} AND #{endDate}")
    BigDecimal sumCaloriesByDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Select("SELECT COALESCE(SUM(er.duration), 0) " +
            "FROM exercise_record er " +
            "WHERE er.user_id = #{userId} AND er.exercise_date BETWEEN #{startDate} AND #{endDate}")
    Integer sumDurationByDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Select("SELECT er.exercise_date, COALESCE(SUM(er.calories), 0) as calories " +
            "FROM exercise_record er " +
            "WHERE er.user_id = #{userId} AND er.exercise_date BETWEEN #{startDate} AND #{endDate} " +
            "GROUP BY er.exercise_date " +
            "ORDER BY er.exercise_date")
    List<Map<String, Object>> selectDailyCalories(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Select("SELECT et.category, COALESCE(SUM(er.duration), 0) as duration, COALESCE(SUM(er.calories), 0) as calories " +
            "FROM exercise_record er " +
            "LEFT JOIN exercise_type et ON er.exercise_type_id = et.id " +
            "WHERE er.user_id = #{userId} AND er.exercise_date BETWEEN #{startDate} AND #{endDate} " +
            "GROUP BY et.category")
    List<Map<String, Object>> selectCategoryStats(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Select("SELECT COUNT(DISTINCT er.exercise_date) " +
            "FROM exercise_record er " +
            "WHERE er.user_id = #{userId} AND er.exercise_date BETWEEN #{startDate} AND #{endDate}")
    Integer countExerciseDays(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

}
