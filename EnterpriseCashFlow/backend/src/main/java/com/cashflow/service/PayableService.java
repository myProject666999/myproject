package com.cashflow.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.cashflow.entity.Payable;

import java.time.LocalDate;
import java.util.List;

public interface PayableService extends IService<Payable> {

    IPage<Payable> pageList(int current, int size, String keyword, Integer status);

    List<Payable> listByDueDateRange(Long companyId, LocalDate startDate, LocalDate endDate);

    Payable addPayable(Payable payable);

    Payable updatePayable(Payable payable);

    Long getTotalPending(Long companyId);
}
