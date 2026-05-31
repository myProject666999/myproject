package com.cashflow.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.cashflow.entity.Receivable;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ReceivableService extends IService<Receivable> {

    IPage<Receivable> pageList(int current, int size, String keyword, String status);

    List<Receivable> listByDueDateRange(LocalDate startDate, LocalDate endDate);

    Receivable addReceivable(Receivable receivable);

    Receivable updateReceivable(Receivable receivable);

    void deleteReceivable(Long id);

    void confirmReceipt(Long id, Long amount, Long accountId);

    Map<String, Object> getStatistics();
}
