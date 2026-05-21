package com.restaurant.repository;

import com.restaurant.entity.RecommendedDish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecommendedDishRepository extends JpaRepository<RecommendedDish, Long> {
    List<RecommendedDish> findByReviewId(Long reviewId);
    List<RecommendedDish> findByRestaurantId(Long restaurantId);
    List<RecommendedDish> findByUserId(Long userId);
    void deleteByReviewId(Long reviewId);
}
