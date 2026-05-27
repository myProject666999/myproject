package com.notification.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.notification.common.Result;
import com.notification.entity.Category;
import com.notification.mapper.CategoryMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService extends ServiceImpl<CategoryMapper, Category> {

    public List<Category> getAllCategories() {
        return this.list(new LambdaQueryWrapper<Category>()
                .eq(Category::getStatus, 1)
                .orderByAsc(Category::getSortOrder));
    }

    public Result<?> addCategory(Category category) {
        this.save(category);
        return Result.success("添加成功");
    }

    public Result<?> updateCategory(Category category) {
        this.updateById(category);
        return Result.success("更新成功");
    }

    public Result<?> deleteCategory(Long id) {
        this.removeById(id);
        return Result.success("删除成功");
    }
}
