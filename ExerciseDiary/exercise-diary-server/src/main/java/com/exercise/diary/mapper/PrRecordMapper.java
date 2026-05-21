package com.exercise.diary.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.exercise.diary.entity.PrRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface PrRecordMapper extends BaseMapper<PrRecord> {

    @Select("SELECT pr.*, et.name as exercise_type_name, et.icon " +
            "FROM pr_record pr " +
            "LEFT JOIN exercise_type et ON pr.exercise_type_id = et.id " +
            "WHERE pr.user_id = #{userId} " +
            "ORDER BY pr.achieved_date DESC")
    List<PrRecord> selectByUserId(@Param("userId") Long userId);

}
