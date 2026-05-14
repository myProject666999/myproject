package com.fishing.reservation.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fishing.reservation.common.Result;
import com.fishing.reservation.entity.CatchRecord;
import com.fishing.reservation.mapper.CatchRecordMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/catch")
public class CatchController {

    @Autowired
    private CatchRecordMapper catchRecordMapper;

    @GetMapping("/list")
    public Result<List<CatchRecord>> list(@RequestParam(required = false) Long userId) {
        LambdaQueryWrapper<CatchRecord> wrapper = new LambdaQueryWrapper<>();
        if (userId != null) {
            wrapper.eq(CatchRecord::getUserId, userId);
        }
        wrapper.orderByDesc(CatchRecord::getWeighTime);
        List<CatchRecord> list = catchRecordMapper.selectList(wrapper);
        return Result.success(list);
    }

    @PostMapping("/weigh")
    public Result<CatchRecord> weigh(@RequestBody CatchRecord record) {
        if (record.getPricePerKg() == null) {
            record.setPricePerKg(new BigDecimal("15.00"));
        }
        record.setTotalPrice(record.getWeight().multiply(record.getPricePerKg()));
        record.setWeighTime(LocalDateTime.now());
        record.setStatus(1);
        catchRecordMapper.insert(record);
        return Result.success("称重成功", record);
    }

    @GetMapping("/today")
    public Result<List<CatchRecord>> today() {
        LocalDateTime start = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime end = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        List<CatchRecord> list = catchRecordMapper.selectList(
            new LambdaQueryWrapper<CatchRecord>()
                .between(CatchRecord::getWeighTime, start, end)
                .orderByDesc(CatchRecord::getWeight)
        );
        return Result.success(list);
    }
}
