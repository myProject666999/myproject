
package com.beautyhair.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beautyhair.entity.Order;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.Map;

public interface OrderMapper extends BaseMapper<Order> {

    @Select("SELECT COALESCE(SUM(paid_amount), 0) FROM `order` WHERE DATE(create_time) = #{date} AND status = 2")
    java.math.BigDecimal sumRevenueByDate(LocalDate date);

    @Select("SELECT DATE_FORMAT(create_time, '%Y-%m-%d') as date, COALESCE(SUM(paid_amount), 0) as amount " +
            "FROM `order` WHERE create_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND status = 2 " +
            "GROUP BY DATE_FORMAT(create_time, '%Y-%m-%d')")
    java.util.List<Map<String, Object>> getLast7DaysRevenue();
}
