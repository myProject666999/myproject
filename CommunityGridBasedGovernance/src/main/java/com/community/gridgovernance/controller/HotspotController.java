package com.community.gridgovernance.controller;

import com.community.gridgovernance.common.Result;
import com.community.gridgovernance.service.HotspotAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hotspot")
public class HotspotController {

    @Autowired
    private HotspotAnalysisService hotspotAnalysisService;

    @GetMapping("/today")
    public Result<List<Map<String, Object>>> getTodayHotspot() {
        return Result.success(hotspotAnalysisService.getTodayHotspotData());
    }

    @GetMapping("/all")
    public Result<List<Map<String, Object>>> getAllTimeHotspot() {
        return Result.success(hotspotAnalysisService.getAllTimeHotspotData());
    }

    @GetMapping("/grid/{gridId}")
    public Result<List<Map<String, Object>>> getHotspotByGrid(
            @PathVariable(required = false) Long gridId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }
        return Result.success(hotspotAnalysisService.getHotspotByGridAndDate(gridId, date));
    }

    @GetMapping("/area/{areaName}")
    public Result<List<Map<String, Object>>> getHotspotByArea(
            @PathVariable String areaName,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }
        return Result.success(hotspotAnalysisService.getHotspotByArea(areaName, date));
    }

    @PostMapping("/generate")
    public Result<String> generateDailyStat() {
        hotspotAnalysisService.generateDailyHotspotStat();
        return Result.success("热点统计生成成功");
    }
}
