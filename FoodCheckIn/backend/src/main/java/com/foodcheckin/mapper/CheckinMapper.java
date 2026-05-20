package com.foodcheckin.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.foodcheckin.entity.Checkin;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Mapper
public interface CheckinMapper extends BaseMapper<Checkin> {

    @Select("SELECT DATE_FORMAT(checkin_date, '%Y-%m-%d') as date, COUNT(*) as count " +
            "FROM checkin WHERE checkin_date BETWEEN #{startDate} AND #{endDate} " +
            "GROUP BY DATE_FORMAT(checkin_date, '%Y-%m-%d')")
    List<Map<String, Object>> countByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Select("SELECT r.id as restaurantId, r.name as restaurantName, COUNT(*) as checkinCount, AVG(c.overall_rating) as avgRating " +
            "FROM checkin c JOIN restaurant r ON c.restaurant_id = r.id " +
            "WHERE c.checkin_date BETWEEN #{startDate} AND #{endDate} " +
            "GROUP BY r.id, r.name ORDER BY checkinCount DESC LIMIT 5")
    List<Map<String, Object>> getTopRestaurants(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Select("SELECT r.cuisine_type as cuisine, COUNT(*) as count " +
            "FROM checkin c JOIN restaurant r ON c.restaurant_id = r.id " +
            "WHERE c.checkin_date BETWEEN #{startDate} AND #{endDate} " +
            "GROUP BY r.cuisine_type")
    List<Map<String, Object>> getCuisineDistribution(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
