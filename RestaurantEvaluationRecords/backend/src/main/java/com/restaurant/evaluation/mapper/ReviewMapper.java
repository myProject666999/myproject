package com.restaurant.evaluation.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.restaurant.evaluation.entity.Review;
import com.restaurant.evaluation.vo.ReviewVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ReviewMapper extends BaseMapper<Review> {

    @Select("SELECT rv.*, u.nickname as user_name, u.avatar as user_avatar, " +
            "r.name as restaurant_name " +
            "FROM review rv " +
            "LEFT JOIN user u ON rv.user_id = u.id " +
            "LEFT JOIN restaurant r ON rv.restaurant_id = r.id " +
            "WHERE rv.restaurant_id = #{restaurantId} " +
            "ORDER BY rv.create_time DESC")
    List<ReviewVO> selectByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Select("SELECT rv.*, u.nickname as user_name, u.avatar as user_avatar, " +
            "r.name as restaurant_name " +
            "FROM review rv " +
            "LEFT JOIN user u ON rv.user_id = u.id " +
            "LEFT JOIN restaurant r ON rv.restaurant_id = r.id " +
            "WHERE rv.user_id = #{userId} " +
            "ORDER BY rv.create_time DESC")
    List<ReviewVO> selectByUserId(@Param("userId") Long userId);

    @Select("SELECT rv.*, u.nickname as user_name, u.avatar as user_avatar, " +
            "r.name as restaurant_name " +
            "FROM review rv " +
            "LEFT JOIN user u ON rv.user_id = u.id " +
            "LEFT JOIN restaurant r ON rv.restaurant_id = r.id " +
            "WHERE rv.user_id IN (" +
            "  SELECT friend_id FROM friendship WHERE user_id = #{userId} AND status = 1" +
            ") " +
            "ORDER BY rv.create_time DESC")
    List<ReviewVO> selectFriendReviews(@Param("userId") Long userId);

}
