package com.restaurant.evaluation.controller;

import com.restaurant.evaluation.common.Result;
import com.restaurant.evaluation.dto.RestaurantDTO;
import com.restaurant.evaluation.entity.Restaurant;
import com.restaurant.evaluation.service.RestaurantService;
import com.restaurant.evaluation.vo.RestaurantVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/restaurant")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @GetMapping("/list")
    public Result<List<RestaurantVO>> getRestaurantList() {
        return restaurantService.getRestaurantList();
    }

    @GetMapping("/detail/{id}")
    public Result<RestaurantVO> getRestaurantDetail(@PathVariable Long id) {
        return restaurantService.getRestaurantDetail(id);
    }

    @PostMapping("/add")
    public Result<Restaurant> addRestaurant(@Validated @RequestBody RestaurantDTO restaurantDTO) {
        return restaurantService.addRestaurant(restaurantDTO);
    }

    @PutMapping("/update/{id}")
    public Result<Restaurant> updateRestaurant(@PathVariable Long id, @Validated @RequestBody RestaurantDTO restaurantDTO) {
        return restaurantService.updateRestaurant(id, restaurantDTO);
    }

    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteRestaurant(@PathVariable Long id) {
        return restaurantService.deleteRestaurant(id);
    }

}
