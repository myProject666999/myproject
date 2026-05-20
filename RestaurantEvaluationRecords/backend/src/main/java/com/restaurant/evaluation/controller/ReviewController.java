package com.restaurant.evaluation.controller;

import com.restaurant.evaluation.common.Result;
import com.restaurant.evaluation.dto.ReviewDTO;
import com.restaurant.evaluation.entity.Review;
import com.restaurant.evaluation.service.ReviewService;
import com.restaurant.evaluation.vo.ReviewVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/review")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/restaurant/{restaurantId}")
    public Result<List<ReviewVO>> getReviewsByRestaurant(@PathVariable Long restaurantId) {
        return reviewService.getReviewsByRestaurant(restaurantId);
    }

    @GetMapping("/my")
    public Result<List<ReviewVO>> getMyReviews() {
        return reviewService.getMyReviews();
    }

    @GetMapping("/friend")
    public Result<List<ReviewVO>> getFriendReviews() {
        return reviewService.getFriendReviews();
    }

    @PostMapping("/add")
    public Result<Review> addReview(@Validated @RequestBody ReviewDTO reviewDTO) {
        return reviewService.addReview(reviewDTO);
    }

    @PutMapping("/update/{id}")
    public Result<Review> updateReview(@PathVariable Long id, @Validated @RequestBody ReviewDTO reviewDTO) {
        return reviewService.updateReview(id, reviewDTO);
    }

    @DeleteMapping("/delete/{id}")
    public Result<Void> deleteReview(@PathVariable Long id) {
        return reviewService.deleteReview(id);
    }

}
