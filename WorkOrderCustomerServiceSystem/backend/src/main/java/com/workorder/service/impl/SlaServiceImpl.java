package com.workorder.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.workorder.constant.TicketConstant;
import com.workorder.entity.*;
import com.workorder.mapper.*;
import com.workorder.service.SlaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SlaServiceImpl implements SlaService {

    private final SlaConfigMapper slaConfigMapper;
    private final TicketMapper ticketMapper;
    private final SlaLogMapper slaLogMapper;
    private final NotificationMapper notificationMapper;
    private final UserMapper userMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String SLA_CACHE_KEY = "sla:ticket:";

    @Override
    @Transactional
    public void calculateSlaDeadline(Ticket ticket) {
        SlaConfig config = slaConfigMapper.selectOne(
                new LambdaQueryWrapper<SlaConfig>().eq(SlaConfig::getPriority, ticket.getPriority())
        );

        if (config != null && config.getResolveHours() != null) {
            LocalDateTime deadline = ticket.getCreatedAt() != null 
                    ? ticket.getCreatedAt() 
                    : LocalDateTime.now();
            
            BigDecimal hours = config.getResolveHours();
            long minutes = hours.multiply(new BigDecimal("60")).longValue();
            deadline = deadline.plus(minutes, ChronoUnit.MINUTES);
            
            ticket.setSlaDeadline(deadline);
            ticket.setSlaStatus(TicketConstant.SLA_STATUS_NORMAL);

            cacheSlaInfo(ticket.getId(), deadline);
        }
    }

    @Override
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void checkSlaWarning() {
        log.info("开始检查SLA预警...");
        
        List<Ticket> tickets = getActiveTickets();
        
        for (Ticket ticket : tickets) {
            if (ticket.getSlaDeadline() == null) continue;
            
            SlaConfig config = slaConfigMapper.selectOne(
                    new LambdaQueryWrapper<SlaConfig>().eq(SlaConfig::getPriority, ticket.getPriority())
            );
            
            if (config == null || config.getWarningHours() == null) continue;
            
            BigDecimal warningHours = config.getWarningHours();
            long warningMinutes = warningHours.multiply(new BigDecimal("60")).longValue();
            
            LocalDateTime warningTime = ticket.getSlaDeadline().minus(warningMinutes, ChronoUnit.MINUTES);
            LocalDateTime now = LocalDateTime.now();
            
            if (now.isAfter(warningTime) && now.isBefore(ticket.getSlaDeadline())) {
                if (!TicketConstant.SLA_STATUS_WARNING.equals(ticket.getSlaStatus())) {
                    ticket.setSlaStatus(TicketConstant.SLA_STATUS_WARNING);
                    ticketMapper.updateById(ticket);
                    
                    saveSlaLog(ticket, TicketConstant.SLA_EVENT_WARNING);
                    sendSlaNotification(ticket, "SLA预警提醒", "工单即将超时，请尽快处理！");
                    
                    log.warn("工单 [{}] 触发SLA预警", ticket.getTicketNo());
                }
            }
        }
    }

    @Override
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void checkSlaOverdue() {
        log.info("开始检查SLA超时...");
        
        List<Ticket> tickets = getActiveTickets();
        
        for (Ticket ticket : tickets) {
            if (ticket.getSlaDeadline() == null) continue;
            
            LocalDateTime now = LocalDateTime.now();
            
            if (now.isAfter(ticket.getSlaDeadline())) {
                if (!TicketConstant.SLA_STATUS_OVERDUE.equals(ticket.getSlaStatus())) {
                    ticket.setSlaStatus(TicketConstant.SLA_STATUS_OVERDUE);
                    ticketMapper.updateById(ticket);
                    
                    saveSlaLog(ticket, TicketConstant.SLA_EVENT_OVERDUE);
                    sendSlaNotification(ticket, "SLA超时提醒", "工单已超时，请立即处理！");
                    
                    log.error("工单 [{}] 已超时！", ticket.getTicketNo());
                }
            }
        }
    }

    @Override
    public List<Ticket> getWarningTickets() {
        return ticketMapper.selectList(
                new LambdaQueryWrapper<Ticket>()
                        .eq(Ticket::getSlaStatus, TicketConstant.SLA_STATUS_WARNING)
                        .ne(Ticket::getStatus, TicketConstant.STATUS_CLOSED)
                        .orderByDesc(Ticket::getSlaDeadline)
        );
    }

    @Override
    public List<Ticket> getOverdueTickets() {
        return ticketMapper.selectList(
                new LambdaQueryWrapper<Ticket>()
                        .eq(Ticket::getSlaStatus, TicketConstant.SLA_STATUS_OVERDUE)
                        .ne(Ticket::getStatus, TicketConstant.STATUS_CLOSED)
                        .orderByDesc(Ticket::getSlaDeadline)
        );
    }

    private List<Ticket> getActiveTickets() {
        return ticketMapper.selectList(
                new LambdaQueryWrapper<Ticket>()
                        .in(Ticket::getStatus, 
                                TicketConstant.STATUS_PENDING,
                                TicketConstant.STATUS_ASSIGNED,
                                TicketConstant.STATUS_PROCESSING)
                        .isNotNull(Ticket::getSlaDeadline)
        );
    }

    private void cacheSlaInfo(Long ticketId, LocalDateTime deadline) {
        String key = SLA_CACHE_KEY + ticketId;
        redisTemplate.opsForValue().set(key, deadline.toString());
    }

    private void saveSlaLog(Ticket ticket, String eventType) {
        SlaLog slaLog = new SlaLog();
        slaLog.setTicketId(ticket.getId());
        slaLog.setEventType(eventType);
        slaLog.setSlaDeadline(ticket.getSlaDeadline());
        slaLog.setActualTime(LocalDateTime.now());
        slaLogMapper.insert(slaLog);
    }

    private void sendSlaNotification(Ticket ticket, String title, String content) {
        if (ticket.getAgentId() != null) {
            Notification notification = new Notification();
            notification.setUserId(ticket.getAgentId());
            notification.setTitle(title + ": " + ticket.getTitle());
            notification.setContent(content + "\n工单编号: " + ticket.getTicketNo());
            notification.setType(TicketConstant.NOTIFICATION_TYPE_SLA);
            notification.setTicketId(ticket.getId());
            notification.setIsRead(false);
            notificationMapper.insert(notification);
        }
    }
}