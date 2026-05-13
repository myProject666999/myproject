package com.recycling.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.recycling.entity.Category;
import java.util.List;

public interface CategoryService extends IService<Category> {
    List<Category> getParentCategories();
    List<Category> getChildrenByParentId(Long parentId);
    List<Category> getAllWithChildren();
}
