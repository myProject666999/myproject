package com.runningroute.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.runningroute.common.Result;
import com.runningroute.entity.Route;
import com.runningroute.service.RouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/route")
public class RouteController {

    @Autowired
    private RouteService routeService;

    @GetMapping("/list")
    public Result<Page<Route>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer difficulty) {
        return Result.success(routeService.getRouteList(page, size, keyword, difficulty));
    }

    @GetMapping("/{id}")
    public Result<Route> detail(@PathVariable Long id) {
        Route route = routeService.getRouteDetail(id);
        if (route != null) {
            return Result.success(route);
        }
        return Result.error("路线不存在");
    }

    @PostMapping("/save")
    public Result<String> save(@RequestBody Route route) {
        boolean result = routeService.saveRoute(route);
        if (result) {
            return Result.success("保存成功");
        }
        return Result.error("保存失败");
    }

    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id) {
        boolean result = routeService.removeById(id);
        if (result) {
            return Result.success("删除成功");
        }
        return Result.error("删除失败");
    }

    @GetMapping("/favorites")
    public Result<List<Route>> favorites(@RequestParam Long userId) {
        return Result.success(routeService.getFavoriteRoutes(userId));
    }
}
