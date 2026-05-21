package com.restaurant.repository;

import com.restaurant.entity.RestaurantReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantReviewRepository extends JpaRepository<RestaurantReview, Long> {
    List<RestaurantReview> findByRestaurantId(Long restaurantId);
    List<RestaurantReview> findByUserId(Long userId);
    Optional<RestaurantReview> findByUserIdAndRestaurantId(Long userId, Long restaurantId);

    @Query("SELECT r FROM RestaurantReview r WHERE r.userId IN (SELECT fr.friendId FROM FriendRelation fr WHERE fr.userId = :userId AND fr.status = 1)")
    List<RestaurantReview> findFriendsReviews(@Param("userId") Long userId);

    @Query("SELECT AVG(r.tasteScore) FROM RestaurantReview r WHERE r.restaurantId = :restaurantId")
    Double getAvgTasteScore(@Param("restaurantId") Long restaurantId);

    @Query("SELECT AVG(r.envScore) FROM RestaurantReview r WHERE r.restaurantId = :restaurantId")
    Double getAvgEnvScore(@Param("restaurantId") Long restaurantId);

    @Query("SELECT AVG(r.serviceScore) FROM RestaurantReview r WHERE r.restaurantId = :restaurantId")
    Double getAvgServiceScore(@Param("restaurantId") Long restaurantId);

    @Query("SELECT AVG(r.overallScore) FROM RestaurantReview r WHERE r.restaurantId = :restaurantId")
    Double getAvgOverallScore(@Param("restaurantId") Long restaurantId);

    @Query("SELECT COUNT(r) FROM RestaurantReview r WHERE r.restaurantId = :restaurantId")
    Integer getReviewCount(@Param("restaurantId") Long restaurantId);
}
