package com.micro.frontend.controller;

import com.micro.frontend.annotation.Audit;
import com.micro.frontend.common.PageResult;
import com.micro.frontend.common.Result;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.dto.RouteSaveDTO;
import com.micro.frontend.entity.RouteConfig;
import com.micro.frontend.service.IRouteConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/route")
public class RouteConfigController {

    @Autowired
    private IRouteConfigService routeConfigService;

    @GetMapping("/{id}")
    public Result<RouteConfig> getById(@PathVariable Long id) {
        return Result.success(routeConfigService.getById(id));
    }

    @GetMapping("/path/{routePath}")
    public Result<RouteConfig> getByRoutePath(@PathVariable String routePath) {
        return Result.success(routeConfigService.getByRoutePath(routePath));
    }

    @GetMapping("/page")
    public Result<PageResult<RouteConfig>> page(PageQueryDTO query) {
        return Result.success(routeConfigService.page(query));
    }

    @GetMapping("/list")
    public Result<List<RouteConfig>> list(PageQueryDTO query) {
        return Result.success(routeConfigService.list(query));
    }

    @PostMapping
    @Audit(operationType = "CREATE", module = "ROUTE", targetTable = "route_config", description = "新增路由配置")
    public Result<Void> save(@RequestBody @Validated RouteSaveDTO dto) {
        routeConfigService.save(dto);
        return Result.success();
    }

    @PutMapping
    @Audit(operationType = "UPDATE", module = "ROUTE", targetTable = "route_config", description = "更新路由配置")
    public Result<Void> update(@RequestBody @Validated RouteSaveDTO dto) {
        routeConfigService.update(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Audit(operationType = "DELETE", module = "ROUTE", targetTable = "route_config", description = "删除路由配置")
    public Result<Void> delete(@PathVariable Long id) {
        routeConfigService.delete(id);
        return Result.success();
    }

    @GetMapping("/tree")
    public Result<List<RouteConfig>> getTree() {
        return Result.success(routeConfigService.getTree());
    }

    @GetMapping("/menu")
    public Result<List<RouteConfig>> getMenuTree() {
        return Result.success(routeConfigService.getMenuTree());
    }

    @PostMapping("/sort/{id}")
    @Audit(operationType = "UPDATE", module = "ROUTE", targetTable = "route_config", description = "更新路由排序")
    public Result<Void> updateSortOrder(@PathVariable Long id, @RequestBody Map<String, Integer> params) {
        Integer sortOrder = params.get("sortOrder");
        routeConfigService.updateSortOrder(id, sortOrder);
        return Result.success();
    }

    @PostMapping("/status/{id}")
    @Audit(operationType = "UPDATE", module = "ROUTE", targetTable = "route_config", description = "更新路由状态")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, Integer> params) {
        Integer status = params.get("status");
        routeConfigService.updateStatus(id, status);
        return Result.success();
    }
}
