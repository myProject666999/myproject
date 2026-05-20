package com.restaurant.evaluation.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.restaurant.evaluation.common.Result;
import com.restaurant.evaluation.dto.RecommendedDishDTO;
import com.restaurant.evaluation.entity.RecommendedDish;
import com.restaurant.evaluation.mapper.RecommendedDishMapper;
import com.restaurant.evaluation.util.UserContext;
import com.restaurant.evaluation.vo.RecommendedDishVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RecommendedDishService {

    @Autowired
    private RecommendedDishMapper recommendedDishMapper;

    public Result<List<RecommendedDishVO>> getDishesByRestaurant(Long restaurantId) {
        List<RecommendedDishVO> dishes = recommendedDishMapper.selectByRestaurantId(restaurantId);
        return Result.success(dishes);
    }

    @Transactional
    public Result<RecommendedDish> addRecommendedDish(RecommendedDishDTO dishDTO) {
        Long userId = UserContext.getUserId();

        QueryWrapper<RecommendedDish> wrapper = new QueryWrapper<>();
        wrapper.eq("restaurant_id", dishDTO.getRestaurantId())
                .eq("dish_name", dishDTO.getDishName());
        RecommendedDish existingDish = recommendedDishMapper.selectOne(wrapper);

        if (existingDish != null) {
            existingDish.setRecommendCount(existingDish.getRecommendCount() + 1);
            recommendedDishMapper.updateById(existingDish);
            return Result.success(existingDish);
        }

        RecommendedDish dish = new RecommendedDish();
        BeanUtils.copyProperties(dishDTO, dish);
        dish.setUserId(userId);
        dish.setRecommendCount(1);
        recommendedDishMapper.insert(dish);

        return Result.success(dish);
    }

}
