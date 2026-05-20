package com.foodcheckin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.foodcheckin.dto.*;
import com.foodcheckin.entity.*;
import com.foodcheckin.mapper.*;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CheckinService extends ServiceImpl<CheckinMapper, Checkin> {

    @Autowired
    private CheckinDishMapper checkinDishMapper;

    @Autowired
    private PhotoMapper photoMapper;

    @Autowired
    private RestaurantMapper restaurantMapper;

    @Autowired
    private DishMapper dishMapper;

    @Transactional(rollbackFor = Exception.class)
    public Checkin createCheckin(CheckinRequest request) {
        Checkin checkin = new Checkin();
        BeanUtils.copyProperties(request, checkin);
        save(checkin);

        if (request.getDishes() != null && !request.getDishes().isEmpty()) {
            for (CheckinRequest.CheckinDishItem item : request.getDishes()) {
                CheckinDish checkinDish = new CheckinDish();
                checkinDish.setCheckinId(checkin.getId());
                checkinDish.setDishId(item.getDishId());
                checkinDish.setRating(item.getRating());
                checkinDish.setComment(item.getComment());
                checkinDishMapper.insert(checkinDish);
            }
            updateDishAvgRating(request.getDishes());
        }

        if (request.getPhotos() != null && !request.getPhotos().isEmpty()) {
            for (CheckinRequest.PhotoItem item : request.getPhotos()) {
                Photo photo = new Photo();
                photo.setCheckinId(checkin.getId());
                photo.setDishId(item.getDishId());
                photo.setPhotoUrl(item.getPhotoUrl());
                photo.setDescription(item.getDescription());
                photoMapper.insert(photo);
            }
        }

        updateRestaurantAvgRating(request.getRestaurantId());

        return checkin;
    }

    private void updateDishAvgRating(List<CheckinRequest.CheckinDishItem> dishes) {
        for (CheckinRequest.CheckinDishItem item : dishes) {
            List<CheckinDish> allRatings = checkinDishMapper.selectList(
                    new LambdaQueryWrapper<CheckinDish>().eq(CheckinDish::getDishId, item.getDishId()));
            if (!allRatings.isEmpty()) {
                BigDecimal avg = allRatings.stream()
                        .map(CheckinDish::getRating)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(allRatings.size()), 2, RoundingMode.HALF_UP);
                Dish dish = dishMapper.selectById(item.getDishId());
                dish.setAvgRating(avg);
                dishMapper.updateById(dish);
            }
        }
    }

    private void updateRestaurantAvgRating(Long restaurantId) {
        List<Checkin> checkins = list(
                new LambdaQueryWrapper<Checkin>().eq(Checkin::getRestaurantId, restaurantId));
        if (!checkins.isEmpty()) {
            BigDecimal avg = checkins.stream()
                    .map(Checkin::getOverallRating)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(checkins.size()), 2, RoundingMode.HALF_UP);
            Restaurant restaurant = restaurantMapper.selectById(restaurantId);
            restaurant.setOverallRating(avg);
            restaurantMapper.updateById(restaurant);
        }
    }

    public CheckinDetailVO getCheckinDetail(Long id) {
        Checkin checkin = getById(id);
        if (checkin == null) {
            return null;
        }

        CheckinDetailVO vo = new CheckinDetailVO();
        BeanUtils.copyProperties(checkin, vo);

        Restaurant restaurant = restaurantMapper.selectById(checkin.getRestaurantId());
        if (restaurant != null) {
            vo.setRestaurantName(restaurant.getName());
        }

        List<CheckinDish> checkinDishes = checkinDishMapper.selectList(
                new LambdaQueryWrapper<CheckinDish>().eq(CheckinDish::getCheckinId, id));
        List<CheckinDetailVO.DishItem> dishItems = checkinDishes.stream().map(cd -> {
            CheckinDetailVO.DishItem item = new CheckinDetailVO.DishItem();
            item.setDishId(cd.getDishId());
            item.setRating(cd.getRating());
            item.setComment(cd.getComment());
            Dish dish = dishMapper.selectById(cd.getDishId());
            if (dish != null) {
                item.setDishName(dish.getName());
            }
            return item;
        }).collect(Collectors.toList());
        vo.setDishes(dishItems);

        List<Photo> photos = photoMapper.selectList(
                new LambdaQueryWrapper<Photo>().eq(Photo::getCheckinId, id));
        List<CheckinDetailVO.PhotoItem> photoItems = photos.stream().map(p -> {
            CheckinDetailVO.PhotoItem item = new CheckinDetailVO.PhotoItem();
            BeanUtils.copyProperties(p, item);
            return item;
        }).collect(Collectors.toList());
        vo.setPhotos(photoItems);

        return vo;
    }

    public List<CheckinSummaryVO> listCheckins(Integer page, Integer size) {
        List<Checkin> checkins = list(
                new LambdaQueryWrapper<Checkin>()
                        .orderByDesc(Checkin::getCheckinDate)
                        .last("LIMIT " + (page - 1) * size + ", " + size));

        return checkins.stream().map(checkin -> {
            CheckinSummaryVO vo = new CheckinSummaryVO();
            BeanUtils.copyProperties(checkin, vo);
            List<Photo> photos = photoMapper.selectList(
                    new LambdaQueryWrapper<Photo>().eq(Photo::getCheckinId, checkin.getId())
                            .last("LIMIT 1"));
            if (!photos.isEmpty()) {
                vo.setPhotoUrl(photos.get(0).getPhotoUrl());
            }
            return vo;
        }).collect(Collectors.toList());
    }

    public MonthReviewVO getMonthReview(Integer year, Integer month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        MonthReviewVO vo = new MonthReviewVO();
        vo.setMonth(yearMonth.format(DateTimeFormatter.ofPattern("yyyy-MM")));

        List<Checkin> monthCheckins = list(
                new LambdaQueryWrapper<Checkin>()
                        .between(Checkin::getCheckinDate, startDate, endDate));

        vo.setTotalCheckins(monthCheckins.size());

        Set<Long> restaurantIds = monthCheckins.stream()
                .map(Checkin::getRestaurantId)
                .collect(Collectors.toSet());
        vo.setTotalRestaurants(restaurantIds.size());

        BigDecimal totalAmount = monthCheckins.stream()
                .map(Checkin::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        vo.setTotalAmount(totalAmount);

        if (!monthCheckins.isEmpty()) {
            BigDecimal avgRating = monthCheckins.stream()
                    .map(Checkin::getOverallRating)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(monthCheckins.size()), 2, RoundingMode.HALF_UP);
            vo.setAvgRating(avgRating);
        } else {
            vo.setAvgRating(BigDecimal.ZERO);
        }

        List<Map<String, Object>> topRestaurantsMap = baseMapper.getTopRestaurants(startDate, endDate);
        List<MonthReviewVO.RestaurantStats> topRestaurants = topRestaurantsMap.stream().map(map -> {
            MonthReviewVO.RestaurantStats stats = new MonthReviewVO.RestaurantStats();
            stats.setRestaurantId(((Number) map.get("restaurantId")).longValue());
            stats.setRestaurantName((String) map.get("restaurantName"));
            stats.setCheckinCount(((Number) map.get("checkinCount")).intValue());
            stats.setAvgRating((BigDecimal) map.get("avgRating"));
            return stats;
        }).collect(Collectors.toList());
        vo.setTopRestaurants(topRestaurants);

        List<Map<String, Object>> topDishesMap = checkinDishMapper.getTopDishes(startDate, endDate);
        List<MonthReviewVO.DishStats> topDishes = topDishesMap.stream().map(map -> {
            MonthReviewVO.DishStats stats = new MonthReviewVO.DishStats();
            stats.setDishId(((Number) map.get("dishId")).longValue());
            stats.setDishName((String) map.get("dishName"));
            stats.setRestaurantName((String) map.get("restaurantName"));
            stats.setAvgRating((BigDecimal) map.get("avgRating"));
            return stats;
        }).collect(Collectors.toList());
        vo.setTopDishes(topDishes);

        List<Map<String, Object>> cuisineMap = baseMapper.getCuisineDistribution(startDate, endDate);
        Map<String, Integer> cuisineDistribution = new HashMap<>();
        for (Map<String, Object> map : cuisineMap) {
            String cuisine = (String) map.get("cuisine");
            Integer count = ((Number) map.get("count")).intValue();
            cuisineDistribution.put(cuisine, count);
        }
        vo.setCuisineDistribution(cuisineDistribution);

        List<Map<String, Object>> dailyMap = baseMapper.countByDateRange(startDate, endDate);
        List<MonthReviewVO.DailyCheckin> dailyCheckins = dailyMap.stream().map(map -> {
            MonthReviewVO.DailyCheckin daily = new MonthReviewVO.DailyCheckin();
            daily.setDate((String) map.get("date"));
            daily.setCount(((Number) map.get("count")).intValue());
            return daily;
        }).collect(Collectors.toList());
        vo.setDailyCheckins(dailyCheckins);

        return vo;
    }

    public void deleteCheckin(Long id) {
        Checkin checkin = getById(id);
        if (checkin != null) {
            removeById(id);
            updateRestaurantAvgRating(checkin.getRestaurantId());
        }
    }
}
