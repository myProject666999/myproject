package com.exercise.diary.controller;

import com.exercise.diary.common.Result;
import com.exercise.diary.entity.PrRecord;
import com.exercise.diary.service.PrRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pr")
@CrossOrigin
public class PrRecordController {

    @Autowired
    private PrRecordService prRecordService;

    @GetMapping("/list")
    public Result<List<PrRecord>> getPrList(@RequestParam(defaultValue = "1") Long userId) {
        return Result.success(prRecordService.getPrList(userId));
    }

}
