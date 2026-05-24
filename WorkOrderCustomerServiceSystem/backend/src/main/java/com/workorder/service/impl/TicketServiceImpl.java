package com.workorder.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.workorder.constant.TicketConstant;
import com.workorder.dto.TicketAssignDTO;
import com.workorder.dto.TicketCreateDTO;
import com.workorder.dto.TicketQueryDTO;
import com.workorder.dto.TicketReplyDTO;
import com.workorder.entity.*;
import com.workorder.exception.BusinessException;
import com.workorder.mapper.*;
import com.workorder.service.SlaService;
import com.workorder.service.TicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketMapper ticketMapper;
    private final TicketCategoryMapper categoryMapper;
    private final TicketReplyMapper replyMapper;
    private final TicketLogMapper logMapper;
    private final UserMapper userMapper;
    private final SlaService slaService;

    private final AtomicInteger ticketCounter = new AtomicInteger(0);

    @Override
    @Transactional
    public Ticket createTicket(TicketCreateDTO dto) {
        TicketCategory category = categoryMapper.selectById(dto.getCategoryId());
        if (category == null) {
            throw new BusinessException(TicketConstant.CATEGORY_NOT_FOUND, "分类不存在");
        }

        Ticket ticket = new Ticket();
        ticket.setTicketNo(generateTicketNo());
        ticket.setTitle(dto.getTitle());
        ticket.setDescription(dto.getDescription());
        ticket.setCategoryId(dto.getCategoryId());
        ticket.setPriority(StringUtils.hasText(dto.getPriority()) ? dto.getPriority() : TicketConstant.PRIORITY_MEDIUM);
        ticket.setStatus(TicketConstant.STATUS_PENDING);
        ticket.setCustomerId(dto.getCustomerId());
        ticket.setSlaStatus(TicketConstant.SLA_STATUS_NORMAL);

        slaService.calculateSlaDeadline(ticket);

        ticketMapper.insert(ticket);

        saveLog(ticket.getId(), TicketConstant.ACTION_CREATE, null, TicketConstant.STATUS_PENDING,
                dto.getCustomerId(), getUserName(dto.getCustomerId()), "创建工单");

        return ticketMapper.selectDetailById(ticket.getId());
    }

    @Override
    public Ticket getTicketById(Long id) {
        Ticket ticket = ticketMapper.selectDetailById(id);
        if (ticket == null) {
            throw new BusinessException(TicketConstant.TICKET_NOT_FOUND, "工单不存在");
        }
        return ticket;
    }

    @Override
    public Page<Ticket> getTicketPage(TicketQueryDTO dto) {
        LambdaQueryWrapper<Ticket> wrapper = new LambdaQueryWrapper<>();
        
        if (StringUtils.hasText(dto.getKeyword())) {
            wrapper.and(w -> w.like(Ticket::getTitle, dto.getKeyword())
                    .or().like(Ticket::getDescription, dto.getKeyword())
                    .or().like(Ticket::getTicketNo, dto.getKeyword()));
        }
        if (StringUtils.hasText(dto.getStatus())) {
            wrapper.eq(Ticket::getStatus, dto.getStatus());
        }
        if (StringUtils.hasText(dto.getPriority())) {
            wrapper.eq(Ticket::getPriority, dto.getPriority());
        }
        if (dto.getCategoryId() != null) {
            wrapper.eq(Ticket::getCategoryId, dto.getCategoryId());
        }
        if (dto.getCustomerId() != null) {
            wrapper.eq(Ticket::getCustomerId, dto.getCustomerId());
        }
        if (dto.getAgentId() != null) {
            wrapper.eq(Ticket::getAgentId, dto.getAgentId());
        }
        if (StringUtils.hasText(dto.getSlaStatus())) {
            wrapper.eq(Ticket::getSlaStatus, dto.getSlaStatus());
        }
        
        wrapper.orderByDesc(Ticket::getCreatedAt);
        
        Page<Ticket> page = new Page<>(dto.getPageNum(), dto.getPageSize());
        return ticketMapper.selectPage(page, wrapper);
    }

    @Override
    @Transactional
    public Ticket assignTicket(TicketAssignDTO dto) {
        Ticket ticket = ticketMapper.selectById(dto.getTicketId());
        if (ticket == null) {
            throw new BusinessException(TicketConstant.TICKET_NOT_FOUND, "工单不存在");
        }

        User agent = userMapper.selectById(dto.getAgentId());
        if (agent == null || !TicketConstant.ROLE_AGENT.equals(agent.getRole())) {
            throw new BusinessException(TicketConstant.USER_NOT_FOUND, "客服不存在或角色不正确");
        }

        ticket.setAgentId(dto.getAgentId());
        ticket.setStatus(TicketConstant.STATUS_ASSIGNED);
        ticketMapper.updateById(ticket);

        saveLog(ticket.getId(), TicketConstant.ACTION_ASSIGN, null, agent.getRealName(),
                dto.getOperatorId(), getUserName(dto.getOperatorId()), "分配工单给: " + agent.getRealName());

        return ticketMapper.selectDetailById(ticket.getId());
    }

    @Override
    @Transactional
    public Ticket updateStatus(Long ticketId, String status, Long operatorId) {
        Ticket ticket = ticketMapper.selectById(ticketId);
        if (ticket == null) {
            throw new BusinessException(TicketConstant.TICKET_NOT_FOUND, "工单不存在");
        }

        String oldStatus = ticket.getStatus();
        ticket.setStatus(status);

        if (TicketConstant.STATUS_RESOLVED.equals(status)) {
            ticket.setResolvedAt(LocalDateTime.now());
        }
        if (TicketConstant.STATUS_CLOSED.equals(status)) {
            ticket.setClosedAt(LocalDateTime.now());
        }

        ticketMapper.updateById(ticket);

        saveLog(ticket.getId(), TicketConstant.ACTION_UPDATE_STATUS, oldStatus, status,
                operatorId, getUserName(operatorId), "更新工单状态");

        return ticketMapper.selectDetailById(ticket.getId());
    }

    @Override
    @Transactional
    public TicketReply replyTicket(TicketReplyDTO dto) {
        Ticket ticket = ticketMapper.selectById(dto.getTicketId());
        if (ticket == null) {
            throw new BusinessException(TicketConstant.TICKET_NOT_FOUND, "工单不存在");
        }

        User user = userMapper.selectById(dto.getUserId());
        if (user == null) {
            throw new BusinessException(TicketConstant.USER_NOT_FOUND, "用户不存在");
        }

        TicketReply reply = new TicketReply();
        reply.setTicketId(dto.getTicketId());
        reply.setUserId(dto.getUserId());
        reply.setUserRole(user.getRole());
        reply.setContent(dto.getContent());
        reply.setAttachments(dto.getAttachments());
        replyMapper.insert(reply);

        if (TicketConstant.ROLE_AGENT.equals(user.getRole()) && TicketConstant.STATUS_ASSIGNED.equals(ticket.getStatus())) {
            ticket.setStatus(TicketConstant.STATUS_PROCESSING);
            ticketMapper.updateById(ticket);
        }

        reply.setUserName(user.getRealName());
        return reply;
    }

    @Override
    public List<TicketReply> getRepliesByTicketId(Long ticketId) {
        return replyMapper.selectByTicketId(ticketId);
    }

    @Override
    public List<Map<String, Object>> getStatusStatistics() {
        return ticketMapper.countByStatus();
    }

    @Override
    public List<Map<String, Object>> getPriorityStatistics() {
        return ticketMapper.countByPriority();
    }

    @Override
    public List<Map<String, Object>> getDateStatistics() {
        return ticketMapper.countByDate();
    }

    @Override
    public List<Map<String, Object>> getAgentStatistics() {
        return ticketMapper.countByAgent();
    }

    private String generateTicketNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int seq = ticketCounter.incrementAndGet();
        if (seq > 9999) {
            ticketCounter.set(1);
            seq = 1;
        }
        return TicketConstant.TICKET_NO_PREFIX + dateStr + String.format("%04d", seq);
    }

    private String getUserName(Long userId) {
        if (userId == null) return "系统";
        User user = userMapper.selectById(userId);
        return user != null ? user.getRealName() : "未知";
    }

    private void saveLog(Long ticketId, String action, String oldValue, String newValue,
                         Long operatorId, String operatorName, String remark) {
        TicketLog log = new TicketLog();
        log.setTicketId(ticketId);
        log.setAction(action);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        log.setOperatorId(operatorId);
        log.setOperatorName(operatorName);
        log.setRemark(remark);
        logMapper.insert(log);
    }
}