package com.example.incomeexpenditure.service;

import com.example.incomeexpenditure.entity.Holiday;
import com.example.incomeexpenditure.mapper.HolidayMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class HolidayService {

    @Autowired
    private HolidayMapper holidayMapper;

    public List<Holiday> getHolidaysByDateRange(LocalDate startDate, LocalDate endDate) {
        return holidayMapper.findByDateRange(startDate, endDate);
    }

    public Holiday getHolidayByDate(LocalDate date) {
        return holidayMapper.findByDate(date);
    }
}
