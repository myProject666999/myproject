package com.cashflow.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.cashflow.entity.Payable;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface PayableService extends IService<Payable> {

    IPage<Payable> pageList(int current, int size, String keyword, String status);

    List<Payable> listByDueDateRange(LocalDate startDate, LocalDate endDate);

    Payable addPayable(Payable payable);

    Payable updatePayable(Payable payable);

    void deletePayable(Long id);

    void confirmPayment(Long id, Long amount, Long accountId);

    Map<String, Object> getStatistics();
}
