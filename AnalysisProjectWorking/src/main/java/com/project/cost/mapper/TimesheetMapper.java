package com.project.cost.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.project.cost.entity.Timesheet;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Mapper
public interface TimesheetMapper extends BaseMapper<Timesheet> {
    
    @Select("SELECT * FROM proj_timesheet WHERE user_id = #{userId} AND work_date = #{workDate} AND timesheet_id != #{excludeId}")
    List<Timesheet> findOverlappingTimesheets(@Param("userId") Long userId, @Param("workDate") LocalDate workDate, @Param("excludeId") Long excludeId);
    
    @Select("SELECT COALESCE(SUM(work_hours), 0) FROM proj_timesheet WHERE user_id = #{userId} AND work_date = #{workDate} AND timesheet_id != #{excludeId}")
    BigDecimal getTotalHoursByDate(@Param("userId") Long userId, @Param("workDate") LocalDate workDate, @Param("excludeId") Long excludeId);
}
