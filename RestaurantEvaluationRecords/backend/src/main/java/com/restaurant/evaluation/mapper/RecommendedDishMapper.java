package com.restaurant.evaluation.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.restaurant.evaluation.entity.RecommendedDish;
import com.restaurant.evaluation.vo.RecommendedDishVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface RecommendedDishMapper extends BaseMapper<RecommendedDish> {

    @Select("SELECT d.*, u.nickname as user_name " +
            "FROM recommended_dish d " +
            "LEFT JOIN user u ON d.user_id = u.id " +
            "WHERE d.restaurant_id = #{restaurantId} " +
            "ORDER BY d.recommend_count DESC")
    List<RecommendedDishVO> selectByRestaurantId(@Param("restaurantId") Long restaurantId);

}
