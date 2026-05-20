package com.foodcheckin.controller;

import com.foodcheckin.common.Result;
import com.foodcheckin.dto.RestaurantDetailVO;
import com.foodcheckin.entity.Dish;
import com.foodcheckin.entity.Restaurant;
import com.foodcheckin.service.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/restaurants")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @GetMapping
    public Result<List<Restaurant>> list() {
        return Result.success(restaurantService.listAll());
    }

    @GetMapping("/{id}")
    public Result<RestaurantDetailVO> getDetail(@PathVariable Long id) {
        RestaurantDetailVO detail = restaurantService.getDetail(id);
        if (detail == null) {
            return Result.error("餐厅不存在");
        }
        return Result.success(detail);
    }

    @PostMapping
    public Result<Restaurant> add(@RequestBody Restaurant restaurant) {
        return Result.success(restaurantService.addRestaurant(restaurant));
    }

    @PutMapping
    public Result<Restaurant> update(@RequestBody Restaurant restaurant) {
        return Result.success(restaurantService.updateRestaurant(restaurant));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        restaurantService.deleteRestaurant(id);
        return Result.success();
    }

    @GetMapping("/{restaurantId}/dishes")
    public Result<List<Dish>> getDishes(@PathVariable Long restaurantId) {
        return Result.success(restaurantService.getDishesByRestaurant(restaurantId));
    }

    @PostMapping("/dishes")
    public Result<Dish> addDish(@RequestBody Dish dish) {
        return Result.success(restaurantService.addDish(dish));
    }

    @PutMapping("/dishes")
    public Result<Dish> updateDish(@RequestBody Dish dish) {
        return Result.success(restaurantService.updateDish(dish));
    }

    @DeleteMapping("/dishes/{id}")
    public Result<Void> deleteDish(@PathVariable Long id) {
        restaurantService.deleteDish(id);
        return Result.success();
    }
}
