package com.health.physical.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.health.physical.entity.ExamReport;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface ExamReportMapper extends BaseMapper<ExamReport> {

    @Select("SELECT * FROM exam_report WHERE user_id = #{userId} ORDER BY exam_date DESC")
    List<ExamReport> selectByUserId(@Param("userId") Long userId);

    @Select("SELECT DISTINCT YEAR(exam_date) as year FROM exam_report WHERE user_id = #{userId} ORDER BY year DESC")
    List<Integer> selectDistinctYears(@Param("userId") Long userId);
}
