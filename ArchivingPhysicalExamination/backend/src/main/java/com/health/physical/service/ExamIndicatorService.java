package com.health.physical.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.health.physical.entity.ExamIndicator;
import com.health.physical.vo.IndicatorTrendVO;
import com.health.physical.vo.YearCompareVO;
import java.util.List;

public interface ExamIndicatorService extends IService<ExamIndicator> {

    List<ExamIndicator> getIndicatorsByReportId(Long reportId);

    IndicatorTrendVO getIndicatorTrend(Long userId, String indicatorName);

    List<String> getDistinctIndicatorNames(Long userId);

    List<YearCompareVO> getYearCompare(Long userId, Integer currentYear, Integer previousYear);
}
