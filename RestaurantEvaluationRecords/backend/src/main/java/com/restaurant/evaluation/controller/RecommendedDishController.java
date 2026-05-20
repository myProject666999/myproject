package com.restaurant.evaluation.controller;

import com.restaurant.evaluation.common.Result;
import com.restaurant.evaluation.dto.RecommendedDishDTO;
import com.restaurant.evaluation.entity.RecommendedDish;
import com.restaurant.evaluation.service.RecommendedDishService;
import com.restaurant.evaluation.vo.RecommendedDishVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dish")
public class RecommendedDishController {

    @Autowired
    private RecommendedDishService recommendedDishService;

    @GetMapping("/restaurant/{restaurantId}")
    public Result<List<RecommendedDishVO>> getDishesByRestaurant(@PathVariable Long restaurantId) {
        return recommendedDishService.getDishesByRestaurant(restaurantId);
    }

    @PostMapping("/add")
    public Result<RecommendedDish> addRecommendedDish(@Validated @RequestBody RecommendedDishDTO dishDTO) {
        return recommendedDishService.addRecommendedDish(dishDTO);
    }

}
