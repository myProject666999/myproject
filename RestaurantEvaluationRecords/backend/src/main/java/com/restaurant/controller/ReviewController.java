package com.restaurant.controller;

import com.restaurant.common.Result;
import com.restaurant.entity.RecommendedDish;
import com.restaurant.entity.RestaurantReview;
import com.restaurant.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/restaurant/{restaurantId}")
    public Result<List<RestaurantReview>> getReviewsByRestaurant(@PathVariable Long restaurantId) {
        return Result.success(reviewService.getReviewsByRestaurant(restaurantId));
    }

    @GetMapping("/user/{userId}")
    public Result<List<RestaurantReview>> getReviewsByUser(@PathVariable Long userId) {
        return Result.success(reviewService.getReviewsByUser(userId));
    }

    @GetMapping("/friends/{userId}")
    public Result<List<RestaurantReview>> getFriendsReviews(@PathVariable Long userId) {
        return Result.success(reviewService.getFriendsReviews(userId));
    }

    @GetMapping("/{id}")
    public Result<RestaurantReview> getReviewById(@PathVariable Long id) {
        return reviewService.getReviewById(id)
                .map(Result::success)
                .orElse(Result.error("评价不存在"));
    }

    @GetMapping("/user/{userId}/restaurant/{restaurantId}")
    public Result<RestaurantReview> getReviewByUserAndRestaurant(@PathVariable Long userId, @PathVariable Long restaurantId) {
        return reviewService.getReviewByUserAndRestaurant(userId, restaurantId)
                .map(Result::success)
                .orElse(Result.error("评价不存在"));
    }

    @PostMapping
    public Result<RestaurantReview> createReview(@RequestBody Map<String, Object> request) {
        RestaurantReview review = new RestaurantReview();
        review.setUserId(Long.valueOf(request.get("userId").toString()));
        review.setRestaurantId(Long.valueOf(request.get("restaurantId").toString()));
        review.setTasteScore(Integer.valueOf(request.get("tasteScore").toString()));
        review.setEnvScore(Integer.valueOf(request.get("envScore").toString()));
        review.setServiceScore(Integer.valueOf(request.get("serviceScore").toString()));
        review.setRepurchaseWillingness(Integer.valueOf(request.getOrDefault("repurchaseWillingness", "0").toString()));
        review.setContent((String) request.get("content"));
        if (request.get("visitDate") != null) {
            review.setVisitDate(java.time.LocalDate.parse(request.get("visitDate").toString()));
        }

        @SuppressWarnings("unchecked")
        List<String> recommendedDishes = (List<String>) request.get("recommendedDishes");

        return Result.success(reviewService.createReview(review, recommendedDishes));
    }

    @PutMapping("/{id}")
    public Result<RestaurantReview> updateReview(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        RestaurantReview reviewDetails = new RestaurantReview();
        reviewDetails.setTasteScore(Integer.valueOf(request.get("tasteScore").toString()));
        reviewDetails.setEnvScore(Integer.valueOf(request.get("envScore").toString()));
        reviewDetails.setServiceScore(Integer.valueOf(request.get("serviceScore").toString()));
        reviewDetails.setRepurchaseWillingness(Integer.valueOf(request.getOrDefault("repurchaseWillingness", "0").toString()));
        reviewDetails.setContent((String) request.get("content"));
        if (request.get("visitDate") != null) {
            reviewDetails.setVisitDate(java.time.LocalDate.parse(request.get("visitDate").toString()));
        }

        @SuppressWarnings("unchecked")
        List<String> recommendedDishes = (List<String>) request.get("recommendedDishes");

        try {
            return Result.success(reviewService.updateReview(id, reviewDetails, recommendedDishes));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return Result.success();
    }

    @GetMapping("/{id}/dishes")
    public Result<List<RecommendedDish>> getRecommendedDishesByReview(@PathVariable Long id) {
        return Result.success(reviewService.getRecommendedDishesByReview(id));
    }

    @GetMapping("/restaurant/{restaurantId}/dishes")
    public Result<List<RecommendedDish>> getRecommendedDishesByRestaurant(@PathVariable Long restaurantId) {
        return Result.success(reviewService.getRecommendedDishesByRestaurant(restaurantId));
    }
}
