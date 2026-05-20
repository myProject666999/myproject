package com.foodcheckin.controller;

import com.foodcheckin.common.Result;
import com.foodcheckin.entity.Restaurant;
import com.foodcheckin.service.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/map")
public class MapController {

    @Autowired
    private RestaurantService restaurantService;

    @GetMapping("/restaurants")
    public Result<List<Restaurant>> getRestaurantsForMap() {
        return Result.success(restaurantService.listAll());
    }
}
