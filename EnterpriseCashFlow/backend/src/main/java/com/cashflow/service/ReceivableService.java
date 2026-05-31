package com.cashflow.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.cashflow.entity.Receivable;

import java.time.LocalDate;
import java.util.List;

public interface ReceivableService extends IService<Receivable> {

    IPage<Receivable> pageList(int current, int size, String keyword, Integer status);

    List<Receivable> listByDueDateRange(Long companyId, LocalDate startDate, LocalDate endDate);

    Receivable addReceivable(Receivable receivable);

    Receivable updateReceivable(Receivable receivable);

    Long getTotalPending(Long companyId);
}
