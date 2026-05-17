package com.example.incomeexpenditure.controller;

import com.example.incomeexpenditure.common.Result;
import com.example.incomeexpenditure.entity.Category;
import com.example.incomeexpenditure.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public Result<List<Category>> getAllCategories() {
        return Result.success(categoryService.getAllCategories());
    }

    @GetMapping("/type/{type}")
    public Result<List<Category>> getCategoriesByType(@PathVariable Integer type) {
        return Result.success(categoryService.getCategoriesByType(type));
    }
}
