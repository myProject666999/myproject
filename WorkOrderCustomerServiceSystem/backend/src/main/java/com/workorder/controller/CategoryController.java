package com.workorder.controller;

import com.workorder.common.Result;
import com.workorder.entity.TicketCategory;
import com.workorder.mapper.TicketCategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final TicketCategoryMapper categoryMapper;

    @GetMapping
    public Result<List<TicketCategory>> getAllCategories() {
        return Result.success(categoryMapper.selectList(null));
    }

    @GetMapping("/{id}")
    public Result<TicketCategory> getCategoryById(@PathVariable Long id) {
        return Result.success(categoryMapper.selectById(id));
    }
}