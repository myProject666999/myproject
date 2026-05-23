package com.restaurant.controller;

import com.restaurant.dto.Result;
import com.restaurant.entity.Category;
import com.restaurant.entity.Dish;
import com.restaurant.service.DishService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dishes")
@RequiredArgsConstructor
public class DishController {
    
    private final DishService dishService;
    
    @GetMapping("/categories")
    public Result<List<Category>> getAllCategories() {
        return Result.success(dishService.getAllCategories());
    }
    
    @GetMapping("/category/{categoryId}")
    public Result<List<Dish>> getDishesByCategory(@PathVariable Long categoryId) {
        return Result.success(dishService.getDishesByCategory(categoryId));
    }
    
    @GetMapping
    public Result<List<Dish>> getAllDishes() {
        return Result.success(dishService.getAllDishes());
    }
    
    @GetMapping("/{id}")
    public Result<Dish> getDishById(@PathVariable Long id) {
        return Result.success(dishService.getDishById(id));
    }
    
    @PostMapping("/categories")
    public Result<Category> createCategory(@RequestBody Category category) {
        return Result.success(dishService.createCategory(category));
    }
    
    @PutMapping("/categories/{id}")
    public Result<Category> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        return Result.success(dishService.updateCategory(id, category));
    }
    
    @DeleteMapping("/categories/{id}")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        dishService.deleteCategory(id);
        return Result.success();
    }
    
    @PostMapping
    public Result<Dish> createDish(@RequestBody Dish dish) {
        return Result.success(dishService.createDish(dish));
    }
    
    @PutMapping("/{id}")
    public Result<Dish> updateDish(@PathVariable Long id, @RequestBody Dish dish) {
        return Result.success(dishService.updateDish(id, dish));
    }
    
    @DeleteMapping("/{id}")
    public Result<Void> deleteDish(@PathVariable Long id) {
        dishService.deleteDish(id);
        return Result.success();
    }
}
