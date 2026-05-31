package com.db.schema.review.controller;

import com.db.schema.review.common.Result;
import com.db.schema.review.entity.ReviewRecord;
import com.db.schema.review.entity.SchemaOrder;
import com.db.schema.review.service.ReviewService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/review")
@CrossOrigin
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/pending")
    public Result<List<SchemaOrder>> getPendingReviewOrders() {
        List<SchemaOrder> list = reviewService.getPendingReviewOrders();
        return Result.success(list);
    }

    @PostMapping("/review")
    public Result<Void> review(@RequestBody ReviewRequest request) {
        reviewService.review(request.getOrderId(), request.getReviewStatus(),
                request.getReviewComment(), request.getReviewLevel());
        return Result.success();
    }

    @GetMapping("/records/{orderId}")
    public Result<List<ReviewRecord>> getReviewRecords(@PathVariable Long orderId) {
        List<ReviewRecord> list = reviewService.getReviewRecords(orderId);
        return Result.success(list);
    }

    @Data
    public static class ReviewRequest {
        private Long orderId;
        private String reviewStatus;
        private String reviewComment;
        private Integer reviewLevel;
    }
}
