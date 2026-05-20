package com.restaurant.evaluation.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.restaurant.evaluation.entity.Restaurant;
import com.restaurant.evaluation.vo.RestaurantVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface RestaurantMapper extends BaseMapper<Restaurant> {

    @Select("SELECT r.*, u.nickname as create_user_name, " +
            "s.avg_taste_score, s.avg_environment_score, s.avg_service_score, " +
            "s.avg_overall_score, s.review_count, s.repurchase_rate " +
            "FROM restaurant r " +
            "LEFT JOIN user u ON r.create_user_id = u.id " +
            "LEFT JOIN restaurant_score_stats s ON r.id = s.restaurant_id " +
            "ORDER BY s.avg_overall_score DESC")
    List<RestaurantVO> selectRestaurantList();

    @Select("SELECT r.*, u.nickname as create_user_name, " +
            "s.avg_taste_score, s.avg_environment_score, s.avg_service_score, " +
            "s.avg_overall_score, s.review_count, s.repurchase_rate " +
            "FROM restaurant r " +
            "LEFT JOIN user u ON r.create_user_id = u.id " +
            "LEFT JOIN restaurant_score_stats s ON r.id = s.restaurant_id " +
            "WHERE r.id = #{id}")
    RestaurantVO selectRestaurantDetail(@Param("id") Long id);

}
