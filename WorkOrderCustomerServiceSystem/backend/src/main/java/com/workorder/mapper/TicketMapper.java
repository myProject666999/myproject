package com.workorder.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.workorder.entity.Ticket;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import java.util.List;
import java.util.Map;

@Mapper
public interface TicketMapper extends BaseMapper<Ticket> {

    @Select("SELECT t.*, u1.real_name as customer_name, u2.real_name as agent_name, c.name as category_name " +
            "FROM ticket t " +
            "LEFT JOIN sys_user u1 ON t.customer_id = u1.id " +
            "LEFT JOIN sys_user u2 ON t.agent_id = u2.id " +
            "LEFT JOIN ticket_category c ON t.category_id = c.id " +
            "WHERE t.id = #{id}")
    Ticket selectDetailById(@Param("id") Long id);

    @Select("SELECT status, COUNT(*) as count FROM ticket GROUP BY status")
    List<Map<String, Object>> countByStatus();

    @Select("SELECT priority, COUNT(*) as count FROM ticket GROUP BY priority")
    List<Map<String, Object>> countByPriority();

    @Select("SELECT DATE(created_at) as date, COUNT(*) as count FROM ticket " +
            "WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY DATE(created_at) ORDER BY date")
    List<Map<String, Object>> countByDate();

    @Select("SELECT u.real_name as agent_name, COUNT(t.id) as count " +
            "FROM sys_user u LEFT JOIN ticket t ON u.id = t.agent_id AND t.status != 'CLOSED' " +
            "WHERE u.role = 'AGENT' AND u.status = 'ACTIVE' GROUP BY u.id, u.real_name ORDER BY count DESC")
    List<Map<String, Object>> countByAgent();
}