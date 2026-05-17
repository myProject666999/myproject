package com.example.incomeexpenditure.controller;

import com.example.incomeexpenditure.common.Result;
import com.example.incomeexpenditure.entity.Holiday;
import com.example.incomeexpenditure.service.HolidayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/holidays")
public class HolidayController {

    @Autowired
    private HolidayService holidayService;

    @GetMapping
    public Result<List<Holiday>> getHolidays(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(holidayService.getHolidaysByDateRange(startDate, endDate));
    }

    @GetMapping("/{date}")
    public Result<Holiday> getHolidayByDate(@PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        return Result.success(holidayService.getHolidayByDate(date));
    }
}
