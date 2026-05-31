package com.market.stall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.market.stall.entity.CheckIn;
import com.market.stall.entity.Event;
import com.market.stall.entity.Payment;
import com.market.stall.entity.Registration;
import com.market.stall.entity.Stall;
import com.market.stall.exception.BusinessException;
import com.market.stall.mapper.CheckInMapper;
import com.market.stall.mapper.EventMapper;
import com.market.stall.mapper.PaymentMapper;
import com.market.stall.mapper.RegistrationMapper;
import com.market.stall.mapper.StallMapper;
import com.market.stall.service.EventReviewService;
import com.market.stall.vo.EventReviewVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventReviewServiceImpl implements EventReviewService {

    private final EventMapper eventMapper;
    private final RegistrationMapper registrationMapper;
    private final StallMapper stallMapper;
    private final PaymentMapper paymentMapper;
    private final CheckInMapper checkInMapper;

    @Override
    public EventReviewVO getEventReview(Long eventId) {
        Event event = eventMapper.selectById(eventId);
        if (event == null) {
            throw new BusinessException("活动不存在");
        }
        EventReviewVO vo = new EventReviewVO();
        vo.setEventId(eventId);
        vo.setEventTitle(event.getTitle());

        Long totalRegistrations = registrationMapper.selectCount(
                new LambdaQueryWrapper<Registration>().eq(Registration::getEventId, eventId)
        );
        vo.setTotalRegistrations(totalRegistrations.intValue());

        Long approvedRegistrations = registrationMapper.selectCount(
                new LambdaQueryWrapper<Registration>()
                        .eq(Registration::getEventId, eventId)
                        .eq(Registration::getAuditStatus, 1)
        );
        vo.setApprovedRegistrations(approvedRegistrations.intValue());

        Long totalStalls = stallMapper.selectCount(
                new LambdaQueryWrapper<Stall>().eq(Stall::getEventId, eventId)
        );
        vo.setTotalStalls(totalStalls.intValue());

        Long occupiedStalls = stallMapper.selectCount(
                new LambdaQueryWrapper<Stall>()
                        .eq(Stall::getEventId, eventId)
                        .ne(Stall::getStatus, 0)
        );
        vo.setOccupiedStalls(occupiedStalls.intValue());

        List<Payment> payments = paymentMapper.selectList(
                new LambdaQueryWrapper<Payment>()
                        .eq(Payment::getEventId, eventId)
                        .eq(Payment::getPaymentType, 0)
                        .eq(Payment::getStatus, 1)
        );
        BigDecimal totalRevenue = payments.stream()
                .map(Payment::getAmount)
                .filter(a -> a != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        vo.setTotalRevenue(totalRevenue);

        List<Payment> refundPayments = paymentMapper.selectList(
                new LambdaQueryWrapper<Payment>()
                        .eq(Payment::getEventId, eventId)
                        .eq(Payment::getStatus, 4)
        );
        BigDecimal totalRefund = refundPayments.stream()
                .map(Payment::getAmount)
                .filter(a -> a != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        vo.setTotalRefund(totalRefund);

        Long checkInCount = checkInMapper.selectCount(
                new LambdaQueryWrapper<CheckIn>().eq(CheckIn::getEventId, eventId)
        );
        vo.setCheckInCount(checkInCount.intValue());

        if (totalRegistrations > 0) {
            vo.setCheckInRate(new BigDecimal(checkInCount)
                    .divide(new BigDecimal(totalRegistrations), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100)));
        } else {
            vo.setCheckInRate(BigDecimal.ZERO);
        }

        List<Registration> allRegistrations = registrationMapper.selectList(
                new LambdaQueryWrapper<Registration>().eq(Registration::getEventId, eventId)
        );
        Map<String, Integer> businessTypeDistribution = new HashMap<>();
        Map<Integer, List<Registration>> grouped = allRegistrations.stream()
                .filter(r -> r.getBusinessType() != null)
                .collect(Collectors.groupingBy(Registration::getBusinessType));
        for (Map.Entry<Integer, List<Registration>> entry : grouped.entrySet()) {
            businessTypeDistribution.put(String.valueOf(entry.getKey()), entry.getValue().size());
        }
        vo.setBusinessTypeDistribution(businessTypeDistribution);

        return vo;
    }
}
