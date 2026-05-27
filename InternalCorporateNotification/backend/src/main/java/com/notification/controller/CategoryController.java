package com.notification.controller;

import com.notification.common.Result;
import com.notification.entity.Category;
import com.notification.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public Result<List<Category>> getAll() {
        return Result.success(categoryService.getAllCategories());
    }

    @PostMapping
    public Result<?> add(@RequestBody Category category) {
        return categoryService.addCategory(category);
    }

    @PutMapping("/{id}")
    public Result<?> update(@PathVariable Long id, @RequestBody Category category) {
        category.setId(id);
        return categoryService.updateCategory(category);
    }

    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id) {
        return categoryService.deleteCategory(id);
    }
}
