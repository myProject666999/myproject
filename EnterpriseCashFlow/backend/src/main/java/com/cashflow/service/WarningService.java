package com.cashflow.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.cashflow.entity.WarningRecord;
import com.cashflow.entity.WarningThreshold;

import java.util.List;

public interface WarningService extends IService<WarningThreshold> {

    List<WarningThreshold> getThresholds();

    WarningThreshold updateThreshold(WarningThreshold threshold);

    IPage<WarningRecord> getActiveWarnings(int current, int size);

    IPage<WarningRecord> getHistoryWarnings(int current, int size);

    void resolveWarning(Long id);

    void checkAndGenerateWarnings();
}
