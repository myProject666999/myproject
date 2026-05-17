package com.example.incomeexpenditure.service;

import com.example.incomeexpenditure.entity.Category;
import com.example.incomeexpenditure.mapper.CategoryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryMapper categoryMapper;

    public List<Category> getAllCategories() {
        return categoryMapper.findAll();
    }

    public List<Category> getCategoriesByType(Integer type) {
        return categoryMapper.findByType(type);
    }

    public Category getCategoryById(Long id) {
        return categoryMapper.findById(id);
    }
}
