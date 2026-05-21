package com.restaurant.controller;

import com.restaurant.common.Result;
import com.restaurant.entity.Restaurant;
import com.restaurant.service.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @GetMapping
    public Result<List<Restaurant>> getAllRestaurants() {
        return Result.success(restaurantService.getAllRestaurants());
    }

    @GetMapping("/{id}")
    public Result<Restaurant> getRestaurantById(@PathVariable Long id) {
        return restaurantService.getRestaurantById(id)
                .map(Result::success)
                .orElse(Result.error("餐厅不存在"));
    }

    @GetMapping("/search")
    public Result<List<Restaurant>> searchRestaurants(@RequestParam String name) {
        return Result.success(restaurantService.searchRestaurantsByName(name));
    }

    @GetMapping("/cuisine/{cuisineType}")
    public Result<List<Restaurant>> getRestaurantsByCuisineType(@PathVariable String cuisineType) {
        return Result.success(restaurantService.getRestaurantsByCuisineType(cuisineType));
    }

    @PostMapping
    public Result<Restaurant> createRestaurant(@RequestBody Restaurant restaurant) {
        return Result.success(restaurantService.createRestaurant(restaurant));
    }

    @PutMapping("/{id}")
    public Result<Restaurant> updateRestaurant(@PathVariable Long id, @RequestBody Restaurant restaurantDetails) {
        try {
            return Result.success(restaurantService.updateRestaurant(id, restaurantDetails));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteRestaurant(@PathVariable Long id) {
        restaurantService.deleteRestaurant(id);
        return Result.success();
    }
}
