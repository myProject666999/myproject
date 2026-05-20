package com.restaurant.evaluation.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.restaurant.evaluation.common.Result;
import com.restaurant.evaluation.dto.ReviewDTO;
import com.restaurant.evaluation.entity.Review;
import com.restaurant.evaluation.mapper.RestaurantScoreStatsMapper;
import com.restaurant.evaluation.mapper.ReviewMapper;
import com.restaurant.evaluation.util.UserContext;
import com.restaurant.evaluation.vo.ReviewVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewMapper reviewMapper;

    @Autowired
    private RestaurantScoreStatsMapper restaurantScoreStatsMapper;

    public Result<List<ReviewVO>> getReviewsByRestaurant(Long restaurantId) {
        List<ReviewVO> reviews = reviewMapper.selectByRestaurantId(restaurantId);
        for (ReviewVO review : reviews) {
            review.setRepurchaseIntentionText(getRepurchaseIntentionText(review.getRepurchaseIntention()));
        }
        return Result.success(reviews);
    }

    public Result<List<ReviewVO>> getMyReviews() {
        Long userId = UserContext.getUserId();
        List<ReviewVO> reviews = reviewMapper.selectByUserId(userId);
        for (ReviewVO review : reviews) {
            review.setRepurchaseIntentionText(getRepurchaseIntentionText(review.getRepurchaseIntention()));
        }
        return Result.success(reviews);
    }

    public Result<List<ReviewVO>> getFriendReviews() {
        Long userId = UserContext.getUserId();
        List<ReviewVO> reviews = reviewMapper.selectFriendReviews(userId);
        for (ReviewVO review : reviews) {
            review.setRepurchaseIntentionText(getRepurchaseIntentionText(review.getRepurchaseIntention()));
        }
        return Result.success(reviews);
    }

    @Transactional
    public Result<Review> addReview(ReviewDTO reviewDTO) {
        Long userId = UserContext.getUserId();

        QueryWrapper<Review> wrapper = new QueryWrapper<>();
        wrapper.eq("restaurant_id", reviewDTO.getRestaurantId())
                .eq("user_id", userId);
        Review existingReview = reviewMapper.selectOne(wrapper);
        if (existingReview != null) {
            return Result.error("您已评价过此餐厅");
        }

        Review review = new Review();
        BeanUtils.copyProperties(reviewDTO, review);
        review.setUserId(userId);

        BigDecimal overallScore = calculateOverallScore(
                reviewDTO.getTasteScore(),
                reviewDTO.getEnvironmentScore(),
                reviewDTO.getServiceScore()
        );
        review.setOverallScore(overallScore);

        reviewMapper.insert(review);

        restaurantScoreStatsMapper.updateStatsByRestaurantId(reviewDTO.getRestaurantId());

        return Result.success(review);
    }

    @Transactional
    public Result<Review> updateReview(Long id, ReviewDTO reviewDTO) {
        Review review = reviewMapper.selectById(id);
        if (review == null) {
            return Result.error("评价不存在");
        }

        Long userId = UserContext.getUserId();
        if (!userId.equals(review.getUserId())) {
            return Result.error("无权限修改此评价");
        }

        BeanUtils.copyProperties(reviewDTO, review);
        BigDecimal overallScore = calculateOverallScore(
                reviewDTO.getTasteScore(),
                reviewDTO.getEnvironmentScore(),
                reviewDTO.getServiceScore()
        );
        review.setOverallScore(overallScore);

        reviewMapper.updateById(review);

        restaurantScoreStatsMapper.updateStatsByRestaurantId(review.getRestaurantId());

        return Result.success(review);
    }

    @Transactional
    public Result<Void> deleteReview(Long id) {
        Review review = reviewMapper.selectById(id);
        if (review == null) {
            return Result.error("评价不存在");
        }

        Long userId = UserContext.getUserId();
        if (!userId.equals(review.getUserId())) {
            return Result.error("无权限删除此评价");
        }

        Long restaurantId = review.getRestaurantId();
        reviewMapper.deleteById(id);

        restaurantScoreStatsMapper.updateStatsByRestaurantId(restaurantId);

        return Result.success();
    }

    private BigDecimal calculateOverallScore(Integer taste, Integer environment, Integer service) {
        double avg = (taste + environment + service) / 3.0;
        return BigDecimal.valueOf(Math.round(avg * 100.0) / 100.0);
    }

    private String getRepurchaseIntentionText(Integer intention) {
        switch (intention) {
            case 1:
                return "不想去";
            case 2:
                return "可能会去";
            case 3:
                return "一定会去";
            default:
                return "未知";
        }
    }

}
