package com.foodcheckin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.foodcheckin.dto.*;
import com.foodcheckin.entity.*;
import com.foodcheckin.mapper.*;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RestaurantService extends ServiceImpl<RestaurantMapper, Restaurant> {

    @Autowired
    private DishMapper dishMapper;

    @Autowired
    private CheckinMapper checkinMapper;

    @Autowired
    private CheckinDishMapper checkinDishMapper;

    @Autowired
    private PhotoMapper photoMapper;

    public List<Restaurant> listAll() {
        return list();
    }

    public RestaurantDetailVO getDetail(Long id) {
        Restaurant restaurant = getById(id);
        if (restaurant == null) {
            return null;
        }

        RestaurantDetailVO vo = new RestaurantDetailVO();
        BeanUtils.copyProperties(restaurant, vo);

        List<Dish> dishes = dishMapper.selectList(
                new LambdaQueryWrapper<Dish>().eq(Dish::getRestaurantId, id));
        List<DishVO> dishVOS = dishes.stream().map(dish -> {
            DishVO dishVO = new DishVO();
            BeanUtils.copyProperties(dish, dishVO);
            Integer count = checkinDishMapper.selectCount(
                    new LambdaQueryWrapper<CheckinDish>().eq(CheckinDish::getDishId, dish.getId())).intValue();
            dishVO.setRatingCount(count);
            return dishVO;
        }).collect(Collectors.toList());
        vo.setDishes(dishVOS);

        Integer checkinCount = checkinMapper.selectCount(
                new LambdaQueryWrapper<Checkin>().eq(Checkin::getRestaurantId, id)).intValue();
        vo.setCheckinCount(checkinCount);

        List<Checkin> checkins = checkinMapper.selectList(
                new LambdaQueryWrapper<Checkin>()
                        .eq(Checkin::getRestaurantId, id)
                        .orderByDesc(Checkin::getCheckinDate)
                        .last("LIMIT 5"));

        List<CheckinSummaryVO> recentCheckins = checkins.stream().map(checkin -> {
            CheckinSummaryVO summaryVO = new CheckinSummaryVO();
            BeanUtils.copyProperties(checkin, summaryVO);
            List<Photo> photos = photoMapper.selectList(
                    new LambdaQueryWrapper<Photo>().eq(Photo::getCheckinId, checkin.getId())
                            .last("LIMIT 1"));
            if (!photos.isEmpty()) {
                summaryVO.setPhotoUrl(photos.get(0).getPhotoUrl());
            }
            return summaryVO;
        }).collect(Collectors.toList());
        vo.setRecentCheckins(recentCheckins);

        return vo;
    }

    public Restaurant addRestaurant(Restaurant restaurant) {
        save(restaurant);
        return restaurant;
    }

    public Restaurant updateRestaurant(Restaurant restaurant) {
        updateById(restaurant);
        return getById(restaurant.getId());
    }

    public void deleteRestaurant(Long id) {
        removeById(id);
    }

    public Dish addDish(Dish dish) {
        dishMapper.insert(dish);
        return dish;
    }

    public Dish updateDish(Dish dish) {
        dishMapper.updateById(dish);
        return dishMapper.selectById(dish.getId());
    }

    public void deleteDish(Long id) {
        dishMapper.deleteById(id);
    }

    public List<Dish> getDishesByRestaurant(Long restaurantId) {
        return dishMapper.selectList(
                new LambdaQueryWrapper<Dish>().eq(Dish::getRestaurantId, restaurantId));
    }
}
