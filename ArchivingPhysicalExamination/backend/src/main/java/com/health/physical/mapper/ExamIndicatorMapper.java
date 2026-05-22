package com.health.physical.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.health.physical.entity.ExamIndicator;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface ExamIndicatorMapper extends BaseMapper<ExamIndicator> {

    @Select("SELECT * FROM exam_indicator WHERE report_id = #{reportId} ORDER BY category_id, id")
    List<ExamIndicator> selectByReportId(@Param("reportId") Long reportId);

    @Select("SELECT ei.* FROM exam_indicator ei " +
            "INNER JOIN exam_report er ON ei.report_id = er.id " +
            "WHERE er.user_id = #{userId} AND ei.indicator_name = #{indicatorName} " +
            "ORDER BY er.exam_date ASC")
    List<ExamIndicator> selectIndicatorTrend(@Param("userId") Long userId, @Param("indicatorName") String indicatorName);

    @Select("SELECT DISTINCT ei.indicator_name FROM exam_indicator ei " +
            "INNER JOIN exam_report er ON ei.report_id = er.id " +
            "WHERE er.user_id = #{userId}")
    List<String> selectDistinctIndicatorNames(@Param("userId") Long userId);
}
