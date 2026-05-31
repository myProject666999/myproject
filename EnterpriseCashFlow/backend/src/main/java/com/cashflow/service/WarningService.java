package com.cashflow.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.cashflow.entity.WarningRecord;

import java.time.LocalDate;
import java.util.List;

public interface WarningService extends IService<WarningRecord> {

    IPage<WarningRecord> pageList(int current, int size, String warningLevel, Integer status);

    List<WarningRecord> listByDateRange(Long companyId, LocalDate startDate, LocalDate endDate);

    void checkAndGenerateWarnings(Long companyId);

    void handleWarning(Long warningId, Integer status);
}
