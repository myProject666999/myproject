package com.recycling.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.recycling.entity.Category;
import com.recycling.mapper.CategoryMapper;
import com.recycling.service.CategoryService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements CategoryService {

    @Override
    public List<Category> getParentCategories() {
        return list(new LambdaQueryWrapper<Category>()
                .eq(Category::getParentId, 0)
                .eq(Category::getStatus, 1)
                .eq(Category::getDeleted, 0)
                .orderByAsc(Category::getSort));
    }

    @Override
    public List<Category> getChildrenByParentId(Long parentId) {
        return list(new LambdaQueryWrapper<Category>()
                .eq(Category::getParentId, parentId)
                .eq(Category::getStatus, 1)
                .eq(Category::getDeleted, 0)
                .orderByAsc(Category::getSort));
    }

    @Override
    public List<Category> getAllWithChildren() {
        return getParentCategories();
    }
}
