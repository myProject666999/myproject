package com.restaurant.evaluation.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.restaurant.evaluation.entity.RestaurantScoreStats;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface RestaurantScoreStatsMapper extends BaseMapper<RestaurantScoreStats> {

    @Update("INSERT INTO restaurant_score_stats " +
            "(restaurant_id, avg_taste_score, avg_environment_score, avg_service_score, " +
            "avg_overall_score, review_count, repurchase_rate) " +
            "SELECT " +
            "#{restaurantId}, " +
            "ROUND(AVG(taste_score), 2), " +
            "ROUND(AVG(environment_score), 2), " +
            "ROUND(AVG(service_score), 2), " +
            "ROUND(AVG(overall_score), 2), " +
            "COUNT(*), " +
            "ROUND(SUM(CASE WHEN repurchase_intention = 3 THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) " +
            "FROM review WHERE restaurant_id = #{restaurantId} " +
            "ON DUPLICATE KEY UPDATE " +
            "avg_taste_score = VALUES(avg_taste_score), " +
            "avg_environment_score = VALUES(avg_environment_score), " +
            "avg_service_score = VALUES(avg_service_score), " +
            "avg_overall_score = VALUES(avg_overall_score), " +
            "review_count = VALUES(review_count), " +
            "repurchase_rate = VALUES(repurchase_rate)")
    void updateStatsByRestaurantId(@Param("restaurantId") Long restaurantId);

}
