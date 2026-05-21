package com.exercise.diary.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.exercise.diary.entity.ExerciseType;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ExerciseTypeMapper extends BaseMapper<ExerciseType> {

    @Select("SELECT * FROM exercise_type ORDER BY sort ASC, id ASC")
    List<ExerciseType> selectAllOrdered();

}
