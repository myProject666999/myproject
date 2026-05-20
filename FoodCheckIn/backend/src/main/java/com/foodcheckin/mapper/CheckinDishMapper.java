package com.foodcheckin.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.foodcheckin.entity.CheckinDish;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Mapper
public interface CheckinDishMapper extends BaseMapper<CheckinDish> {

    @Select("SELECT d.id as dishId, d.name as dishName, r.name as restaurantName, AVG(cd.rating) as avgRating " +
            "FROM checkin_dish cd " +
            "JOIN dish d ON cd.dish_id = d.id " +
            "JOIN restaurant r ON d.restaurant_id = r.id " +
            "JOIN checkin c ON cd.checkin_id = c.id " +
            "WHERE c.checkin_date BETWEEN #{startDate} AND #{endDate} " +
            "GROUP BY d.id, d.name, r.name ORDER BY avgRating DESC LIMIT 5")
    List<Map<String, Object>> getTopDishes(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
