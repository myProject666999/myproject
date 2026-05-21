package com.nutrition.controller;

import com.nutrition.common.Result;
import com.nutrition.entity.Food;
import com.nutrition.service.FoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/foods")
public class FoodController {

    @Autowired
    private FoodService foodService;

    @GetMapping
    public Result<List<Food>> list(@RequestParam(required = false) String keyword,
                                   @RequestParam(required = false) String category) {
        return Result.success(foodService.searchFoods(keyword, category));
    }

    @GetMapping("/{id}")
    public Result<Food> getById(@PathVariable Long id) {
        return Result.success(foodService.getById(id));
    }

    @GetMapping("/categories")
    public Result<List<String>> getCategories() {
        return Result.success(foodService.getAllCategories());
    }

    @PostMapping
    public Result<Void> save(@RequestBody Food food) {
        foodService.saveOrUpdate(food);
        return Result.success();
    }

    @PutMapping
    public Result<Void> update(@RequestBody Food food) {
        foodService.updateById(food);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        foodService.removeById(id);
        return Result.success();
    }
}
