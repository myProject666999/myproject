package com.onsiterepair.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.onsiterepair.entity.Review;
import com.onsiterepair.entity.Worker;
import com.onsiterepair.exception.BusinessException;
import com.onsiterepair.mapper.ReviewMapper;
import com.onsiterepair.mapper.WorkerMapper;
import com.onsiterepair.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl extends ServiceImpl<ReviewMapper, Review> implements ReviewService {

    private final WorkerMapper workerMapper;

    @Override
    @Transactional
    public Review createReview(Review review) {
        Review existReview = getOne(new LambdaQueryWrapper<Review>().eq(Review::getOrderId, review.getOrderId()));
        if (existReview != null) {
            throw new BusinessException("该订单已评价");
        }
        review.setStatus(1);
        save(review);
        updateWorkerRating(review.getWorkerId());
        return review;
    }

    @Override
    public List<Review> getWorkerReviews(Long workerId) {
        return list(new LambdaQueryWrapper<Review>()
                .eq(Review::getWorkerId, workerId)
                .eq(Review::getStatus, 1)
                .orderByDesc(Review::getCreateTime));
    }

    @Override
    @Transactional
    public Review replyReview(Long reviewId, Long workerId, String content) {
        Review review = getById(reviewId);
        if (review == null) {
            throw new BusinessException("评价不存在");
        }
        if (!review.getWorkerId().equals(workerId)) {
            throw new BusinessException("无权限回复");
        }
        review.setReplyContent(content);
        review.setReplyTime(LocalDateTime.now());
        updateById(review);
        return review;
    }

    private void updateWorkerRating(Long workerId) {
        List<Review> reviews = getWorkerReviews(workerId);
        if (reviews.isEmpty()) {
            return;
        }
        double avg = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(5.0);
        
        Worker worker = workerMapper.selectById(workerId);
        if (worker != null) {
            worker.setRating(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
            workerMapper.updateById(worker);
        }
    }
}
