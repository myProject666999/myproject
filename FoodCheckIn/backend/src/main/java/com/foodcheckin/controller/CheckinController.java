package com.foodcheckin.controller;

import com.foodcheckin.common.Result;
import com.foodcheckin.dto.CheckinDetailVO;
import com.foodcheckin.dto.CheckinRequest;
import com.foodcheckin.dto.CheckinSummaryVO;
import com.foodcheckin.dto.MonthReviewVO;
import com.foodcheckin.entity.Checkin;
import com.foodcheckin.service.CheckinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/checkins")
public class CheckinController {

    @Autowired
    private CheckinService checkinService;

    @PostMapping
    public Result<Checkin> create(@RequestBody CheckinRequest request) {
        return Result.success(checkinService.createCheckin(request));
    }

    @GetMapping("/{id}")
    public Result<CheckinDetailVO> getDetail(@PathVariable Long id) {
        CheckinDetailVO detail = checkinService.getCheckinDetail(id);
        if (detail == null) {
            return Result.error("打卡记录不存在");
        }
        return Result.success(detail);
    }

    @GetMapping
    public Result<List<CheckinSummaryVO>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        return Result.success(checkinService.listCheckins(page, size));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        checkinService.deleteCheckin(id);
        return Result.success();
    }

    @GetMapping("/month-review")
    public Result<MonthReviewVO> getMonthReview(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        if (year == null || month == null) {
            LocalDate now = LocalDate.now();
            year = now.getYear();
            month = now.getMonthValue();
        }
        return Result.success(checkinService.getMonthReview(year, month));
    }
}
