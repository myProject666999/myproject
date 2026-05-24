package com.workorder.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.workorder.entity.TicketReply;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface TicketReplyMapper extends BaseMapper<TicketReply> {

    @Select("SELECT r.*, u.real_name as user_name FROM ticket_reply r " +
            "LEFT JOIN sys_user u ON r.user_id = u.id " +
            "WHERE r.ticket_id = #{ticketId} ORDER BY r.created_at ASC")
    List<TicketReply> selectByTicketId(@Param("ticketId") Long ticketId);
}