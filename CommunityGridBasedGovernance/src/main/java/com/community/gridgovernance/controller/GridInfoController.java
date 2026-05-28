package com.community.gridgovernance.controller;

import com.community.gridgovernance.common.Result;
import com.community.gridgovernance.entity.GridInfo;
import com.community.gridgovernance.service.GridInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/grid")
public class GridInfoController {

    @Autowired
    private GridInfoService gridInfoService;

    @GetMapping("/list")
    public Result<List<GridInfo>> getAllGrids() {
        return Result.success(gridInfoService.getAllGrids());
    }

    @GetMapping("/{id}")
    public Result<GridInfo> getGridById(@PathVariable Long id) {
        return Result.success(gridInfoService.getById(id));
    }

    @GetMapping("/locate")
    public Result<GridInfo> locateGrid(@RequestParam BigDecimal lng, @RequestParam BigDecimal lat) {
        GridInfo grid = gridInfoService.findGridByLocation(lng, lat);
        if (grid == null) {
            return Result.error(404, "当前位置不在任何网格范围内");
        }
        return Result.success(grid);
    }

    @GetMapping("/area/{areaName}")
    public Result<List<GridInfo>> getGridsByArea(@PathVariable String areaName) {
        return Result.success(gridInfoService.getGridsByAreaName(areaName));
    }
}
