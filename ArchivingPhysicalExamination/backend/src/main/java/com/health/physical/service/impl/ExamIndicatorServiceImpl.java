package com.health.physical.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.health.physical.entity.AbnormalRule;
import com.health.physical.entity.ExamIndicator;
import com.health.physical.entity.ExamReport;
import com.health.physical.mapper.ExamIndicatorMapper;
import com.health.physical.service.AbnormalRuleService;
import com.health.physical.service.ExamIndicatorService;
import com.health.physical.service.ExamReportService;
import com.health.physical.vo.IndicatorTrendVO;
import com.health.physical.vo.YearCompareVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExamIndicatorServiceImpl extends ServiceImpl<ExamIndicatorMapper, ExamIndicator> implements ExamIndicatorService {

    @Autowired
    private ExamReportService examReportService;

    @Autowired
    private AbnormalRuleService abnormalRuleService;

    @Override
    public List<ExamIndicator> getIndicatorsByReportId(Long reportId) {
        return baseMapper.selectByReportId(reportId);
    }

    @Override
    public IndicatorTrendVO getIndicatorTrend(Long userId, String indicatorName) {
        List<ExamIndicator> indicators = baseMapper.selectIndicatorTrend(userId, indicatorName);

        IndicatorTrendVO vo = new IndicatorTrendVO();
        vo.setIndicatorName(indicatorName);

        if (!indicators.isEmpty()) {
            ExamIndicator first = indicators.get(0);
            vo.setIndicatorCode(first.getIndicatorCode());
            vo.setValueUnit(first.getValueUnit());

            AbnormalRule rule = abnormalRuleService.getRuleByIndicatorName(indicatorName);
            if (rule != null) {
                vo.setMinNormal(rule.getMinNormal());
                vo.setMaxNormal(rule.getMaxNormal());
            }
        }

        List<IndicatorTrendVO.TrendPoint> trendPoints = indicators.stream().map(indicator -> {
            IndicatorTrendVO.TrendPoint point = new IndicatorTrendVO.TrendPoint();
            point.setIndicatorValue(indicator.getIndicatorValue());
            point.setReferenceRange(indicator.getReferenceRange());
            point.setResultStatus(indicator.getResultStatus());
            point.setReportId(indicator.getReportId());

            ExamReport report = examReportService.getById(indicator.getReportId());
            if (report != null) {
                point.setExamDate(report.getExamDate());
            }
            return point;
        }).collect(Collectors.toList());

        vo.setTrendPoints(trendPoints);
        return vo;
    }

    @Override
    public List<String> getDistinctIndicatorNames(Long userId) {
        return baseMapper.selectDistinctIndicatorNames(userId);
    }

    @Override
    public List<YearCompareVO> getYearCompare(Long userId, Integer currentYear, Integer previousYear) {
        QueryWrapper<ExamReport> currentWrapper = new QueryWrapper<>();
        currentWrapper.eq("user_id", userId)
                .eq("YEAR(exam_date)", currentYear)
                .orderByDesc("exam_date");
        List<ExamReport> currentReports = examReportService.list(currentWrapper);

        QueryWrapper<ExamReport> previousWrapper = new QueryWrapper<>();
        previousWrapper.eq("user_id", userId)
                .eq("YEAR(exam_date)", previousYear)
                .orderByDesc("exam_date");
        List<ExamReport> previousReports = examReportService.list(previousWrapper);

        if (currentReports.isEmpty() || previousReports.isEmpty()) {
            return Collections.emptyList();
        }

        ExamReport currentReport = currentReports.get(0);
        ExamReport previousReport = previousReports.get(0);

        List<ExamIndicator> currentIndicators = getIndicatorsByReportId(currentReport.getId());
        List<ExamIndicator> previousIndicators = getIndicatorsByReportId(previousReport.getId());

        Map<String, ExamIndicator> previousMap = previousIndicators.stream()
                .collect(Collectors.toMap(ExamIndicator::getIndicatorName, i -> i, (a, b) -> a));

        List<YearCompareVO> result = new ArrayList<>();
        for (ExamIndicator current : currentIndicators) {
            ExamIndicator previous = previousMap.get(current.getIndicatorName());
            if (previous != null && current.getIndicatorValue() != null && previous.getIndicatorValue() != null) {
                YearCompareVO vo = new YearCompareVO();
                vo.setIndicatorName(current.getIndicatorName());
                vo.setValueUnit(current.getValueUnit());
                vo.setCurrentYearValue(current.getIndicatorValue());
                vo.setPreviousYearValue(previous.getIndicatorValue());
                vo.setReferenceRange(current.getReferenceRange());
                vo.setCurrentResultStatus(current.getResultStatus());
                vo.setPreviousResultStatus(previous.getResultStatus());
                vo.setCurrentExamDate(currentReport.getExamDate());
                vo.setPreviousExamDate(previousReport.getExamDate());

                BigDecimal change = current.getIndicatorValue().subtract(previous.getIndicatorValue());
                vo.setChangeValue(change);

                if (previous.getIndicatorValue().compareTo(BigDecimal.ZERO) != 0) {
                    BigDecimal rate = change.divide(previous.getIndicatorValue(), 4, RoundingMode.HALF_UP)
                            .multiply(new BigDecimal("100"));
                    vo.setChangeRate(rate);
                }

                result.add(vo);
            }
        }

        return result;
    }
}
