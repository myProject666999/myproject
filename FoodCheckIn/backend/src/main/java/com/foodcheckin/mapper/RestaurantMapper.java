package com.foodcheckin.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.foodcheckin.entity.Restaurant;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface RestaurantMapper extends BaseMapper<Restaurant> {
}
