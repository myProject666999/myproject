package com.market.stall.service.impl;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.market.stall.dto.PaymentDTO;
import com.market.stall.dto.RefundDTO;
import com.market.stall.entity.Event;
import com.market.stall.entity.Payment;
import com.market.stall.entity.Registration;
import com.market.stall.entity.Stall;
import com.market.stall.entity.SysUser;
import com.market.stall.exception.BusinessException;
import com.market.stall.mapper.EventMapper;
import com.market.stall.mapper.PaymentMapper;
import com.market.stall.mapper.RegistrationMapper;
import com.market.stall.mapper.StallMapper;
import com.market.stall.mapper.SysUserMapper;
import com.market.stall.service.PaymentService;
import com.market.stall.service.StallSelectionService;
import com.market.stall.vo.PaymentVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentMapper paymentMapper;
    private final RegistrationMapper registrationMapper;
    private final StallMapper stallMapper;
    private final EventMapper eventMapper;
    private final SysUserMapper sysUserMapper;
    private final StallSelectionService stallSelectionService;

    @Override
    public Payment createPayment(PaymentDTO dto, Long userId) {
        Registration registration = registrationMapper.selectById(dto.getRegistrationId());
        if (registration == null) {
            throw new BusinessException("报名记录不存在");
        }
        if (!registration.getUserId().equals(userId)) {
            throw new BusinessException("无权操作该报名记录");
        }
        Stall stall = null;
        if (registration.getStallId() != null) {
            stall = stallMapper.selectById(registration.getStallId());
        }
        Payment payment = new Payment();
        payment.setPaymentNo(IdUtil.getSnowflakeNextIdStr());
        payment.setRegistrationId(dto.getRegistrationId());
        payment.setUserId(userId);
        payment.setEventId(registration.getEventId());
        payment.setStallId(registration.getStallId());
        payment.setAmount(stall != null ? stall.getPrice() : null);
        payment.setPaymentType(0);
        payment.setPaymentMethod(dto.getPaymentMethod());
        payment.setStatus(0);
        paymentMapper.insert(payment);
        return payment;
    }

    @Override
    @Transactional
    public void confirmPayment(String paymentNo) {
        Payment payment = paymentMapper.selectOne(
                new LambdaQueryWrapper<Payment>().eq(Payment::getPaymentNo, paymentNo)
        );
        if (payment == null) {
            throw new BusinessException("支付记录不存在");
        }
        if (payment.getStatus() != 0) {
            throw new BusinessException("支付状态异常");
        }
        payment.setStatus(1);
        payment.setPayTime(LocalDateTime.now());
        paymentMapper.updateById(payment);
        Registration registration = registrationMapper.selectById(payment.getRegistrationId());
        if (registration != null) {
            registration.setStatus(2);
            registrationMapper.updateById(registration);
        }
        if (payment.getStallId() != null) {
            Stall stall = stallMapper.selectById(payment.getStallId());
            if (stall != null) {
                stall.setStatus(2);
                stallMapper.updateById(stall);
            }
        }
        if (payment.getUserId() != null) {
            stallSelectionService.confirmStall(payment.getRegistrationId(), payment.getUserId());
        }
    }

    @Override
    public IPage<PaymentVO> pagePayments(IPage<Payment> page, Long eventId, Integer status, Integer paymentType) {
        IPage<Payment> paymentPage = paymentMapper.selectPageByCondition(page, eventId, status, paymentType);
        return paymentPage.convert(this::toPaymentVO);
    }

    @Override
    public void requestRefund(RefundDTO dto, Long userId) {
        Payment payment = paymentMapper.selectById(dto.getPaymentId());
        if (payment == null) {
            throw new BusinessException("支付记录不存在");
        }
        if (!payment.getUserId().equals(userId)) {
            throw new BusinessException("无权操作该支付记录");
        }
        if (payment.getStatus() != 1) {
            throw new BusinessException("当前状态不可退款");
        }
        payment.setPaymentType(1);
        payment.setStatus(3);
        payment.setRefundReason(dto.getRefundReason());
        paymentMapper.updateById(payment);
    }

    @Override
    @Transactional
    public void processRefund(Long paymentId, boolean approved) {
        Payment payment = paymentMapper.selectById(paymentId);
        if (payment == null) {
            throw new BusinessException("支付记录不存在");
        }
        if (payment.getStatus() != 3) {
            throw new BusinessException("当前状态不可处理退款");
        }
        if (approved) {
            payment.setStatus(4);
            payment.setRefundTime(LocalDateTime.now());
            paymentMapper.updateById(payment);
            if (payment.getStallId() != null) {
                Stall stall = stallMapper.selectById(payment.getStallId());
                if (stall != null) {
                    stall.setStatus(0);
                    stallMapper.updateById(stall);
                }
            }
            Registration registration = registrationMapper.selectById(payment.getRegistrationId());
            if (registration != null) {
                registration.setStatus(4);
                registrationMapper.updateById(registration);
            }
        } else {
            payment.setStatus(5);
            paymentMapper.updateById(payment);
        }
    }

    private PaymentVO toPaymentVO(Payment payment) {
        PaymentVO vo = new PaymentVO();
        BeanUtils.copyProperties(payment, vo);
        if (payment.getUserId() != null) {
            SysUser user = sysUserMapper.selectById(payment.getUserId());
            if (user != null) {
                vo.setUsername(user.getUsername());
            }
        }
        if (payment.getStallId() != null) {
            Stall stall = stallMapper.selectById(payment.getStallId());
            if (stall != null) {
                vo.setStallCode(stall.getStallCode());
            }
        }
        if (payment.getRegistrationId() != null) {
            Registration registration = registrationMapper.selectById(payment.getRegistrationId());
            if (registration != null) {
                vo.setBusinessName(registration.getBusinessName());
            }
        }
        if (payment.getEventId() != null) {
            Event event = eventMapper.selectById(payment.getEventId());
            if (event != null) {
                vo.setEventName(event.getTitle());
            }
        }
        return vo;
    }
}
