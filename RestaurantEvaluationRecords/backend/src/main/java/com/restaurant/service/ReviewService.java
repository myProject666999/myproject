package com.restaurant.service;

import com.restaurant.entity.RecommendedDish;
import com.restaurant.entity.RestaurantReview;
import com.restaurant.entity.User;
import com.restaurant.repository.RecommendedDishRepository;
import com.restaurant.repository.RestaurantReviewRepository;
import com.restaurant.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private RestaurantReviewRepository reviewRepository;

    @Autowired
    private RecommendedDishRepository recommendedDishRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestaurantService restaurantService;

    public List<RestaurantReview> getReviewsByRestaurant(Long restaurantId) {
        return enrichReviewsWithUserInfo(reviewRepository.findByRestaurantId(restaurantId));
    }

    public List<RestaurantReview> getReviewsByUser(Long userId) {
        return enrichReviewsWithUserInfo(reviewRepository.findByUserId(userId));
    }

    public List<RestaurantReview> getFriendsReviews(Long userId) {
        return enrichReviewsWithUserInfo(reviewRepository.findFriendsReviews(userId));
    }

    public Optional<RestaurantReview> getReviewById(Long id) {
        return reviewRepository.findById(id).map(this::enrichReviewWithUserInfo);
    }

    public Optional<RestaurantReview> getReviewByUserAndRestaurant(Long userId, Long restaurantId) {
        return reviewRepository.findByUserIdAndRestaurantId(userId, restaurantId).map(this::enrichReviewWithUserInfo);
    }

    @Transactional
    public RestaurantReview createReview(RestaurantReview review, List<String> recommendedDishes) {
        BigDecimal overallScore = BigDecimal.valueOf((review.getTasteScore() + review.getEnvScore() + review.getServiceScore()) / 3.0);
        review.setOverallScore(overallScore);

        RestaurantReview savedReview = reviewRepository.save(review);

        if (recommendedDishes != null && !recommendedDishes.isEmpty()) {
            for (String dishName : recommendedDishes) {
                RecommendedDish dish = new RecommendedDish();
                dish.setReviewId(savedReview.getId());
                dish.setUserId(savedReview.getUserId());
                dish.setRestaurantId(savedReview.getRestaurantId());
                dish.setDishName(dishName);
                recommendedDishRepository.save(dish);
            }
        }

        restaurantService.updateRestaurantScores(review.getRestaurantId());

        return enrichReviewWithUserInfo(savedReview);
    }

    @Transactional
    public RestaurantReview updateReview(Long id, RestaurantReview reviewDetails, List<String> recommendedDishes) {
        return reviewRepository.findById(id).map(review -> {
            review.setTasteScore(reviewDetails.getTasteScore());
            review.setEnvScore(reviewDetails.getEnvScore());
            review.setServiceScore(reviewDetails.getServiceScore());
            review.setRepurchaseWillingness(reviewDetails.getRepurchaseWillingness());
            review.setContent(reviewDetails.getContent());
            review.setVisitDate(reviewDetails.getVisitDate());

            BigDecimal overallScore = BigDecimal.valueOf((reviewDetails.getTasteScore() + reviewDetails.getEnvScore() + reviewDetails.getServiceScore()) / 3.0);
            review.setOverallScore(overallScore);

            recommendedDishRepository.deleteByReviewId(id);

            if (recommendedDishes != null && !recommendedDishes.isEmpty()) {
                for (String dishName : recommendedDishes) {
                    RecommendedDish dish = new RecommendedDish();
                    dish.setReviewId(id);
                    dish.setReviewId(review.getId());
                    dish.setUserId(review.getUserId());
                    dish.setRestaurantId(review.getRestaurantId());
                    dish.setDishName(dishName);
                    recommendedDishRepository.save(dish);
                }
            }

            RestaurantReview updatedReview = reviewRepository.save(review);
            restaurantService.updateRestaurantScores(review.getRestaurantId());

            return enrichReviewWithUserInfo(updatedReview);
        }).orElseThrow(() -> new RuntimeException("评价不存在"));
    }

    @Transactional
    public void deleteReview(Long id) {
        reviewRepository.findById(id).ifPresent(review -> {
            Long restaurantId = review.getRestaurantId();
            recommendedDishRepository.deleteByReviewId(id);
            reviewRepository.deleteById(id);
            restaurantService.updateRestaurantScores(restaurantId);
        });
    }

    public List<RecommendedDish> getRecommendedDishesByReview(Long reviewId) {
        return recommendedDishRepository.findByReviewId(reviewId);
    }

    public List<RecommendedDish> getRecommendedDishesByRestaurant(Long restaurantId) {
        return recommendedDishRepository.findByRestaurantId(restaurantId);
    }

    private RestaurantReview enrichReviewWithUserInfo(RestaurantReview review) {
        if (review != null && review.getUserId() != null) {
            userRepository.findById(review.getUserId()).ifPresent(user -> {
                review.setNickname(user.getNickname());
                review.setAvatar(user.getAvatar());
            });
        }
        return review;
    }

    private List<RestaurantReview> enrichReviewsWithUserInfo(List<RestaurantReview> reviews) {
        return reviews.stream().map(this::enrichReviewWithUserInfo).collect(Collectors.toList());
    }
}
