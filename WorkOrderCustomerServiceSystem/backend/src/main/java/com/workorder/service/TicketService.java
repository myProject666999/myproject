package com.workorder.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.workorder.dto.TicketAssignDTO;
import com.workorder.dto.TicketCreateDTO;
import com.workorder.dto.TicketQueryDTO;
import com.workorder.dto.TicketReplyDTO;
import com.workorder.entity.Ticket;
import com.workorder.entity.TicketReply;
import java.util.List;
import java.util.Map;

public interface TicketService {

    Ticket createTicket(TicketCreateDTO dto);

    Ticket getTicketById(Long id);

    Page<Ticket> getTicketPage(TicketQueryDTO dto);

    Ticket assignTicket(TicketAssignDTO dto);

    Ticket updateStatus(Long ticketId, String status, Long operatorId);

    TicketReply replyTicket(TicketReplyDTO dto);

    List<TicketReply> getRepliesByTicketId(Long ticketId);

    List<Map<String, Object>> getStatusStatistics();

    List<Map<String, Object>> getPriorityStatistics();

    List<Map<String, Object>> getDateStatistics();

    List<Map<String, Object>> getAgentStatistics();
}