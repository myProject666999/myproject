package com.example.incomeexpenditure.mapper;

import com.example.incomeexpenditure.entity.Holiday;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDate;
import java.util.List;

public interface HolidayMapper {
    List<Holiday> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    Holiday findByDate(@Param("date") LocalDate date);
}
