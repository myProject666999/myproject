package com.nutrition.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nutrition.entity.Food;
import com.nutrition.mapper.FoodMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class FoodService extends ServiceImpl<FoodMapper, Food> {

    public List<Food> searchFoods(String keyword, String category) {
        LambdaQueryWrapper<Food> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(Food::getName, keyword);
        }
        if (StringUtils.hasText(category)) {
            wrapper.eq(Food::getCategory, category);
        }
        wrapper.orderByDesc(Food::getUpdateTime);
        return list(wrapper);
    }

    public List<String> getAllCategories() {
        return baseMapper.selectList(new LambdaQueryWrapper<Food>()
                        .select(Food::getCategory)
                        .groupBy(Food::getCategory))
                .stream()
                .map(Food::getCategory)
                .distinct()
                .toList();
    }
}
