package com.market.stall.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.market.stall.dto.PaymentDTO;
import com.market.stall.dto.RefundDTO;
import com.market.stall.entity.Payment;
import com.market.stall.vo.PaymentVO;

public interface PaymentService {

    Payment createPayment(PaymentDTO dto, Long userId);

    void confirmPayment(String paymentNo);

    IPage<PaymentVO> pagePayments(IPage<Payment> page, Long eventId, Integer status, Integer paymentType);

    void requestRefund(RefundDTO dto, Long userId);

    void processRefund(Long paymentId, boolean approved);
}
