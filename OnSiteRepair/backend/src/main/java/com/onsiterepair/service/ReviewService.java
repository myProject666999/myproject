package com.onsiterepair.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.onsiterepair.entity.Review;

import java.util.List;

public interface ReviewService extends IService<Review> {
    Review createReview(Review review);
    List<Review> getWorkerReviews(Long workerId);
    Review replyReview(Long reviewId, Long workerId, String content);
}
