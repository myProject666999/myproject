package com.itinerary.controller;

import com.itinerary.common.Result;
import com.itinerary.entity.Category;
import com.itinerary.mapper.CategoryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/category")
@CrossOrigin
public class CategoryController {

    @Autowired
    private CategoryMapper categoryMapper;

    @GetMapping
    public Result<List<Category>> getAllCategories() {
        return Result.success(categoryMapper.selectList(null));
    }
}
