package com.emojipack.service.impl;

import com.emojipack.entity.Category;
import com.emojipack.mapper.CategoryMapper;
import com.emojipack.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryMapper categoryMapper;

    @Override
    public List<Category> list() {
        return categoryMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<Category>()
                        .eq("status", 1)
                        .orderByAsc("sort")
        );
    }

    @Override
    public Category getById(Long id) {
        return categoryMapper.selectById(id);
    }
}
