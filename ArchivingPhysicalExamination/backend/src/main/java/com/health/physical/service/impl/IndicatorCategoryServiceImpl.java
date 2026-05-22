package com.health.physical.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.health.physical.entity.IndicatorCategory;
import com.health.physical.mapper.IndicatorCategoryMapper;
import com.health.physical.service.IndicatorCategoryService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IndicatorCategoryServiceImpl extends ServiceImpl<IndicatorCategoryMapper, IndicatorCategory> implements IndicatorCategoryService {

    @Override
    public List<IndicatorCategory> getAllCategories() {
        QueryWrapper<IndicatorCategory> wrapper = new QueryWrapper<>();
        wrapper.orderByAsc("sort_order");
        return list(wrapper);
    }
}
