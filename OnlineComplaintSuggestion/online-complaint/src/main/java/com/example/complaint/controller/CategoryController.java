package com.example.complaint.controller;

import com.example.complaint.common.Result;
import com.example.complaint.entity.ComplaintCategory;
import com.example.complaint.repository.ComplaintCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final ComplaintCategoryRepository categoryRepository;

    @GetMapping
    public Result<List<ComplaintCategory>> getAll() {
        return Result.success(categoryRepository.findAll());
    }
}
