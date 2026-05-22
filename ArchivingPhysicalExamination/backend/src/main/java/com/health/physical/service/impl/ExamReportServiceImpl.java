package com.health.physical.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.health.physical.entity.AbnormalRule;
import com.health.physical.entity.ExamIndicator;
import com.health.physical.entity.ExamReport;
import com.health.physical.entity.IndicatorCategory;
import com.health.physical.mapper.ExamReportMapper;
import com.health.physical.service.*;
import com.health.physical.vo.AbnormalIndicatorVO;
import com.health.physical.vo.ReportDetailVO;
import com.health.physical.vo.ReportListVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExamReportServiceImpl extends ServiceImpl<ExamReportMapper, ExamReport> implements ExamReportService {

    @Autowired
    @Lazy
    private ExamIndicatorService examIndicatorService;

    @Autowired
    private AbnormalRuleService abnormalRuleService;

    @Autowired
    private IndicatorCategoryService indicatorCategoryService;

    @Override
    public List<ReportListVO> getReportList(Long userId) {
        QueryWrapper<ExamReport> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).orderByDesc("exam_date");
        List<ExamReport> reports = list(wrapper);

        return reports.stream().map(report -> {
            ReportListVO vo = new ReportListVO();
            vo.setId(report.getId());
            vo.setUserId(report.getUserId());
            vo.setExamDate(report.getExamDate());
            vo.setHospital(report.getHospital());
            vo.setReportNo(report.getReportNo());
            vo.setFileName(report.getFileName());
            vo.setOverallResult(report.getOverallResult());

            List<ExamIndicator> indicators = examIndicatorService.list(
                    new QueryWrapper<ExamIndicator>().eq("report_id", report.getId())
            );
            vo.setIndicatorCount(indicators.size());
            vo.setAbnormalCount((int) indicators.stream().filter(i -> i.getIsAbnormal() == 1).count());

            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    public ReportDetailVO getReportDetail(Long reportId) {
        ExamReport report = getById(reportId);
        if (report == null) {
            return null;
        }

        ReportDetailVO vo = new ReportDetailVO();
        vo.setId(report.getId());
        vo.setUserId(report.getUserId());
        vo.setExamDate(report.getExamDate());
        vo.setHospital(report.getHospital());
        vo.setReportNo(report.getReportNo());
        vo.setFilePath(report.getFilePath());
        vo.setFileName(report.getFileName());
        vo.setOverallResult(report.getOverallResult());
        vo.setDoctor(report.getDoctor());
        vo.setRemark(report.getRemark());

        List<ExamIndicator> indicators = examIndicatorService.list(
                new QueryWrapper<ExamIndicator>().eq("report_id", reportId).orderByAsc("category_id", "id")
        );
        vo.setIndicators(indicators);

        Map<String, List<ExamIndicator>> indicatorsByCategory = new LinkedHashMap<>();
        List<IndicatorCategory> categories = indicatorCategoryService.list();
        Map<Long, String> categoryNameMap = categories.stream()
                .collect(Collectors.toMap(IndicatorCategory::getId, IndicatorCategory::getName));

        for (ExamIndicator indicator : indicators) {
            String categoryName = indicator.getCategoryId() != null
                    ? categoryNameMap.getOrDefault(indicator.getCategoryId(), "其他")
                    : "其他";
            indicatorsByCategory.computeIfAbsent(categoryName, k -> new ArrayList<>()).add(indicator);
        }
        vo.setIndicatorsByCategory(indicatorsByCategory);

        List<ExamIndicator> abnormalIndicators = indicators.stream()
                .filter(i -> i.getIsAbnormal() == 1)
                .collect(Collectors.toList());
        List<AbnormalIndicatorVO> abnormalVOList = new ArrayList<>();
        for (ExamIndicator indicator : abnormalIndicators) {
            AbnormalIndicatorVO abnormalVO = new AbnormalIndicatorVO();
            abnormalVO.setIndicatorId(indicator.getId());
            abnormalVO.setIndicatorName(indicator.getIndicatorName());
            abnormalVO.setIndicatorCode(indicator.getIndicatorCode());
            abnormalVO.setIndicatorValue(indicator.getIndicatorValue());
            abnormalVO.setValueUnit(indicator.getValueUnit());
            abnormalVO.setReferenceRange(indicator.getReferenceRange());
            abnormalVO.setResultStatus(indicator.getResultStatus());

            AbnormalRule rule = abnormalRuleService.getRuleByIndicatorName(indicator.getIndicatorName());
            if (rule != null) {
                abnormalVO.setDescription(rule.getDescription());
                abnormalVO.setSuggestion(rule.getSuggestion());
                abnormalVO.setWarningLevel(rule.getWarningLevel());
            }
            abnormalVOList.add(abnormalVO);
        }
        vo.setAbnormalIndicators(abnormalVOList);

        return vo;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean saveReportWithIndicators(ExamReport report, List<ExamIndicator> indicators) {
        boolean saved = save(report);
        if (saved && indicators != null) {
            for (ExamIndicator indicator : indicators) {
                indicator.setReportId(report.getId());
                checkAbnormal(indicator);
            }
            examIndicatorService.saveBatch(indicators);
        }
        return saved;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteReport(Long reportId) {
        examIndicatorService.remove(new QueryWrapper<ExamIndicator>().eq("report_id", reportId));
        return removeById(reportId);
    }

    @Override
    public List<Integer> getAvailableYears(Long userId) {
        return baseMapper.selectDistinctYears(userId);
    }

    private void checkAbnormal(ExamIndicator indicator) {
        if (indicator.getIndicatorValue() == null) {
            indicator.setIsAbnormal(0);
            indicator.setResultStatus(0);
            return;
        }

        AbnormalRule rule = abnormalRuleService.getRuleByIndicatorName(indicator.getIndicatorName());
        if (rule == null) {
            if (indicator.getMinValue() != null && indicator.getMaxValue() != null) {
                BigDecimal value = indicator.getIndicatorValue();
                if (value.compareTo(indicator.getMaxValue()) > 0) {
                    indicator.setIsAbnormal(1);
                    indicator.setResultStatus(1);
                } else if (value.compareTo(indicator.getMinValue()) < 0) {
                    indicator.setIsAbnormal(1);
                    indicator.setResultStatus(2);
                } else {
                    indicator.setIsAbnormal(0);
                    indicator.setResultStatus(0);
                }
            }
            return;
        }

        BigDecimal value = indicator.getIndicatorValue();
        if (rule.getMaxNormal() != null && value.compareTo(rule.getMaxNormal()) > 0) {
            indicator.setIsAbnormal(1);
            indicator.setResultStatus(1);
        } else if (rule.getMinNormal() != null && value.compareTo(rule.getMinNormal()) < 0) {
            indicator.setIsAbnormal(1);
            indicator.setResultStatus(2);
        } else {
            indicator.setIsAbnormal(0);
            indicator.setResultStatus(0);
        }
    }
}
