package com.diary.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.diary.entity.Diary;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface DiaryMapper extends BaseMapper<Diary> {

    @Select("SELECT * FROM diary WHERE user_id = #{userId} AND diary_date = #{date} LIMIT 1")
    Diary findByUserIdAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Select("SELECT * FROM diary WHERE user_id = #{userId} AND diary_date BETWEEN #{startDate} AND #{endDate} ORDER BY diary_date ASC")
    List<Diary> findByUserIdAndDateRange(@Param("userId") Long userId,
                                          @Param("startDate") LocalDate startDate,
                                          @Param("endDate") LocalDate endDate);
}
