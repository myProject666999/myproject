package com.recycling.controller;

import com.recycling.common.Result;
import com.recycling.entity.Category;
import com.recycling.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/category")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping("/list")
    public Result<List<Category>> listParentCategories() {
        return Result.success(categoryService.getParentCategories());
    }

    @GetMapping("/children/{parentId}")
    public Result<List<Category>> listChildren(@PathVariable Long parentId) {
        return Result.success(categoryService.getChildrenByParentId(parentId));
    }

    @GetMapping("/{id}")
    public Result<Category> getById(@PathVariable Long id) {
        return Result.success(categoryService.getById(id));
    }
}
