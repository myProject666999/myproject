package com.market.stall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.market.stall.entity.Event;
import com.market.stall.entity.Payment;
import com.market.stall.entity.Registration;
import com.market.stall.mapper.EventMapper;
import com.market.stall.mapper.PaymentMapper;
import com.market.stall.mapper.RegistrationMapper;
import com.market.stall.service.DashboardService;
import com.market.stall.vo.DashboardVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final EventMapper eventMapper;
    private final RegistrationMapper registrationMapper;
    private final PaymentMapper paymentMapper;

    @Override
    public DashboardVO getDashboard() {
        DashboardVO vo = new DashboardVO();
        Long totalEvents = eventMapper.selectCount(new LambdaQueryWrapper<>());
        vo.setTotalEvents(totalEvents.intValue());
        Long activeEvents = eventMapper.selectCount(
                new LambdaQueryWrapper<Event>().eq(Event::getStatus, 1)
        );
        vo.setActiveEvents(activeEvents.intValue());
        Long totalRegistrations = registrationMapper.selectCount(new LambdaQueryWrapper<>());
        vo.setTotalRegistrations(totalRegistrations.intValue());
        List<Payment> payments = paymentMapper.selectList(
                new LambdaQueryWrapper<Payment>()
                        .eq(Payment::getPaymentType, 0)
                        .eq(Payment::getStatus, 1)
        );
        BigDecimal totalRevenue = payments.stream()
                .map(Payment::getAmount)
                .filter(a -> a != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        vo.setTotalRevenue(totalRevenue);
        Long pendingAuditCount = registrationMapper.selectCount(
                new LambdaQueryWrapper<Registration>().eq(Registration::getAuditStatus, 0)
        );
        vo.setPendingAuditCount(pendingAuditCount.intValue());
        return vo;
    }
}
