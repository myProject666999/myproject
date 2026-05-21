package com.restaurant.service;

import com.restaurant.entity.Restaurant;
import com.restaurant.entity.RestaurantReview;
import com.restaurant.repository.RestaurantRepository;
import com.restaurant.repository.RestaurantReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private RestaurantReviewRepository reviewRepository;

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    public Optional<Restaurant> getRestaurantById(Long id) {
        return restaurantRepository.findById(id);
    }

    public List<Restaurant> searchRestaurantsByName(String name) {
        return restaurantRepository.findByNameContaining(name);
    }

    public List<Restaurant> getRestaurantsByCuisineType(String cuisineType) {
        return restaurantRepository.findByCuisineType(cuisineType);
    }

    @Transactional
    public Restaurant createRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }

    @Transactional
    public Restaurant updateRestaurant(Long id, Restaurant restaurantDetails) {
        return restaurantRepository.findById(id).map(restaurant -> {
            restaurant.setName(restaurantDetails.getName());
            restaurant.setAddress(restaurantDetails.getAddress());
            restaurant.setPhone(restaurantDetails.getPhone());
            restaurant.setCuisineType(restaurantDetails.getCuisineType());
            restaurant.setPriceRange(restaurantDetails.getPriceRange());
            restaurant.setCoverImage(restaurantDetails.getCoverImage());
            return restaurantRepository.save(restaurant);
        }).orElseThrow(() -> new RuntimeException("餐厅不存在"));
    }

    @Transactional
    public void deleteRestaurant(Long id) {
        restaurantRepository.deleteById(id);
    }

    public void updateRestaurantScores(Long restaurantId) {
        restaurantRepository.findById(restaurantId).ifPresent(restaurant -> {
            Double avgTaste = reviewRepository.getAvgTasteScore(restaurantId);
            Double avgEnv = reviewRepository.getAvgEnvScore(restaurantId);
            Double avgService = reviewRepository.getAvgServiceScore(restaurantId);
            Double avgOverall = reviewRepository.getAvgOverallScore(restaurantId);
            Integer count = reviewRepository.getReviewCount(restaurantId);

            restaurant.setAvgTasteScore(avgTaste != null ? BigDecimal.valueOf(avgTaste) : BigDecimal.ZERO);
            restaurant.setAvgEnvScore(avgEnv != null ? BigDecimal.valueOf(avgEnv) : BigDecimal.ZERO);
            restaurant.setAvgServiceScore(avgService != null ? BigDecimal.valueOf(avgService) : BigDecimal.ZERO);
            restaurant.setAvgOverallScore(avgOverall != null ? BigDecimal.valueOf(avgOverall) : BigDecimal.ZERO);
            restaurant.setReviewCount(count != null ? count : 0);

            restaurantRepository.save(restaurant);
        });
    }
}
