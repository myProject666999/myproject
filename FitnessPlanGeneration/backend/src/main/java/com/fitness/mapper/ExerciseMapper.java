package com.fitness.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fitness.entity.Exercise;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface ExerciseMapper extends BaseMapper<Exercise> {
    @Select("SELECT * FROM exercise WHERE category = #{category} AND (suitable_for_goal = #{goal} OR suitable_for_goal = 'ALL')")
    List<Exercise> selectByCategoryAndGoal(@Param("category") String category, @Param("goal") String goal);

    @Select("SELECT * FROM exercise WHERE category = #{category}")
    List<Exercise> selectByCategory(@Param("category") String category);
}
