package com.restaurant.evaluation.service;

import com.restaurant.evaluation.common.Result;
import com.restaurant.evaluation.dto.RestaurantDTO;
import com.restaurant.evaluation.entity.Restaurant;
import com.restaurant.evaluation.entity.RestaurantScoreStats;
import com.restaurant.evaluation.mapper.RecommendedDishMapper;
import com.restaurant.evaluation.mapper.RestaurantMapper;
import com.restaurant.evaluation.mapper.RestaurantScoreStatsMapper;
import com.restaurant.evaluation.mapper.ReviewMapper;
import com.restaurant.evaluation.util.UserContext;
import com.restaurant.evaluation.vo.RecommendedDishVO;
import com.restaurant.evaluation.vo.RestaurantVO;
import com.restaurant.evaluation.vo.ReviewVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RestaurantService {

    @Autowired
    private RestaurantMapper restaurantMapper;

    @Autowired
    private ReviewMapper reviewMapper;

    @Autowired
    private RecommendedDishMapper recommendedDishMapper;

    @Autowired
    private RestaurantScoreStatsMapper restaurantScoreStatsMapper;

    public Result<List<RestaurantVO>> getRestaurantList() {
        List<RestaurantVO> list = restaurantMapper.selectRestaurantList();
        return Result.success(list);
    }

    public Result<RestaurantVO> getRestaurantDetail(Long id) {
        RestaurantVO restaurant = restaurantMapper.selectRestaurantDetail(id);
        if (restaurant == null) {
            return Result.error("餐厅不存在");
        }

        List<ReviewVO> reviews = reviewMapper.selectByRestaurantId(id);
        for (ReviewVO review : reviews) {
            review.setRepurchaseIntentionText(getRepurchaseIntentionText(review.getRepurchaseIntention()));
        }
        restaurant.setReviews(reviews);

        List<RecommendedDishVO> dishes = recommendedDishMapper.selectByRestaurantId(id);
        restaurant.setRecommendedDishes(dishes);

        return Result.success(restaurant);
    }

    @Transactional
    public Result<Restaurant> addRestaurant(RestaurantDTO restaurantDTO) {
        Long userId = UserContext.getUserId();
        Restaurant restaurant = new Restaurant();
        BeanUtils.copyProperties(restaurantDTO, restaurant);
        restaurant.setCreateUserId(userId);
        restaurantMapper.insert(restaurant);

        RestaurantScoreStats stats = new RestaurantScoreStats();
        stats.setRestaurantId(restaurant.getId());
        restaurantScoreStatsMapper.insert(stats);

        return Result.success(restaurant);
    }

    @Transactional
    public Result<Restaurant> updateRestaurant(Long id, RestaurantDTO restaurantDTO) {
        Restaurant restaurant = restaurantMapper.selectById(id);
        if (restaurant == null) {
            return Result.error("餐厅不存在");
        }

        Long userId = UserContext.getUserId();
        if (!userId.equals(restaurant.getCreateUserId())) {
            return Result.error("无权限修改此餐厅");
        }

        BeanUtils.copyProperties(restaurantDTO, restaurant);
        restaurantMapper.updateById(restaurant);
        return Result.success(restaurant);
    }

    @Transactional
    public Result<Void> deleteRestaurant(Long id) {
        Restaurant restaurant = restaurantMapper.selectById(id);
        if (restaurant == null) {
            return Result.error("餐厅不存在");
        }

        Long userId = UserContext.getUserId();
        if (!userId.equals(restaurant.getCreateUserId())) {
            return Result.error("无权限删除此餐厅");
        }

        restaurantMapper.deleteById(id);
        return Result.success();
    }

    private String getRepurchaseIntentionText(Integer intention) {
        switch (intention) {
            case 1:
                return "不想去";
            case 2:
                return "可能会去";
            case 3:
                return "一定会去";
            default:
                return "未知";
        }
    }

}
