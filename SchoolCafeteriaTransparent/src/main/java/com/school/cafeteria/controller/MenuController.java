package com.school.cafeteria.controller;

import com.school.cafeteria.common.Result;
import com.school.cafeteria.entity.Menu;
import com.school.cafeteria.service.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    @Autowired
    private MenuService menuService;

    @GetMapping("/public/date/{date}")
    public Result<List<Menu>> getMenuByDate(@PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        List<Menu> menus = menuService.getMenuByDate(date);
        return Result.success(menus);
    }

    @GetMapping("/public/range")
    public Result<List<Menu>> getMenuByDateRange(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        List<Menu> menus = menuService.getMenuByDateRange(startDate, endDate);
        return Result.success(menus);
    }

    @GetMapping("/public/{id}")
    public Result<Menu> getMenuById(@PathVariable Long id) {
        Optional<Menu> menu = menuService.getMenuById(id);
        return menu.map(Result::success).orElse(Result.error("菜谱不存在"));
    }

    @PostMapping
    public Result<Menu> createMenu(@RequestBody Menu menu) {
        Menu saved = menuService.saveMenu(menu);
        return Result.success("创建成功", saved);
    }

    @PutMapping("/{id}")
    public Result<Menu> updateMenu(@PathVariable Long id, @RequestBody Menu menu) {
        Optional<Menu> existing = menuService.getMenuById(id);
        if (!existing.isPresent()) {
            return Result.error("菜谱不存在");
        }
        menu.setId(id);
        Menu saved = menuService.saveMenu(menu);
        return Result.success("更新成功", saved);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteMenu(@PathVariable Long id) {
        menuService.deleteMenu(id);
        return Result.success();
    }

    @PostMapping("/batch")
    public Result<List<Menu>> batchCreateMenus(@RequestBody List<Menu> menus) {
        List<Menu> saved = menuService.saveAllMenus(menus);
        return Result.success("批量创建成功", saved);
    }
}
