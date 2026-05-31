package com.market.stall.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.market.stall.entity.Payment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PaymentMapper extends BaseMapper<Payment> {

    IPage<Payment> selectPageByCondition(IPage<Payment> page,
                                         @Param("eventId") Long eventId,
                                         @Param("status") Integer status,
                                         @Param("paymentType") Integer paymentType);
}
