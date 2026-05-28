package com.project.cost.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.project.cost.entity.WorkCalendar;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;

@Mapper
public interface WorkCalendarMapper extends BaseMapper<WorkCalendar> {
    
    @Select("SELECT COUNT(*) FROM sys_work_calendar WHERE calendar_date BETWEEN #{startDate} AND #{endDate} AND date_type = 1")
    Long countWorkDays(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
