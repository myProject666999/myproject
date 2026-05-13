package com.chess.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.chess.entity.Orders;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Mapper
public interface OrdersMapper extends BaseMapper<Orders> {

    @Select("SELECT o.*, t.table_no, m.name as member_name " +
            "FROM orders o LEFT JOIN table_info t ON o.table_id = t.id " +
            "LEFT JOIN member m ON o.member_id = m.id " +
            "WHERE o.table_id = #{tableId} AND o.status = 0 " +
            "ORDER BY o.create_time DESC LIMIT 1")
    Orders selectActiveOrderByTableId(@Param("tableId") Long tableId);

    @Select("SELECT o.*, t.table_no, m.name as member_name " +
            "FROM orders o LEFT JOIN table_info t ON o.table_id = t.id " +
            "LEFT JOIN member m ON o.member_id = m.id " +
            "WHERE o.status = 0 ORDER BY o.create_time DESC")
    List<Orders> selectActiveOrders();

    @Select("SELECT o.*, t.table_no, m.name as member_name " +
            "FROM orders o LEFT JOIN table_info t ON o.table_id = t.id " +
            "LEFT JOIN member m ON o.member_id = m.id " +
            "WHERE o.id = #{id}")
    Orders selectByIdWithDetail(@Param("id") Long id);

    @Select("SELECT DATE(create_time) as date, COUNT(*) as orderCount, " +
            "SUM(pay_amount) as totalAmount " +
            "FROM orders WHERE status = 1 " +
            "AND create_time BETWEEN #{startTime} AND #{endTime} " +
            "GROUP BY DATE(create_time) ORDER BY date")
    List<Map<String, Object>> selectDailyReport(@Param("startTime") LocalDateTime startTime,
                                                 @Param("endTime") LocalDateTime endTime);

    @Select("SELECT COUNT(*) as orderCount, SUM(pay_amount) as totalAmount, " +
            "AVG(pay_amount) as avgAmount FROM orders WHERE status = 1 " +
            "AND create_time BETWEEN #{startTime} AND #{endTime}")
    Map<String, Object> selectSummaryReport(@Param("startTime") LocalDateTime startTime,
                                            @Param("endTime") LocalDateTime endTime);
}
