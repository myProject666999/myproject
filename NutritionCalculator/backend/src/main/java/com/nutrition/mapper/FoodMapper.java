package com.nutrition.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.nutrition.entity.Food;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface FoodMapper extends BaseMapper<Food> {
}
