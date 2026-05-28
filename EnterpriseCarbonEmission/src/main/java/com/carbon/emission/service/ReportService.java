package com.carbon.emission.service;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.carbon.emission.entity.EsgIndicatorData;
import com.carbon.emission.entity.Report;
import com.carbon.emission.mapper.ReportMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService extends ServiceImpl<ReportMapper, Report> {

    @Autowired
    private EmissionCalculationService calculationService;

    @Autowired
    private EsgIndicatorDataService esgIndicatorDataService;

    @Transactional(rollbackFor = Exception.class)
    public Report generateReport(Long orgId, Integer reportType, Integer periodType, String periodValue, String createBy) {
        Report report = new Report();
        report.setReportNo("RPT" + System.currentTimeMillis());
        report.setReportName((reportType == 1 ? "碳排放报告" : "ESG报告") + "-" + periodValue);
        report.setReportType(reportType);
        report.setOrgId(orgId);
        report.setPeriodType(periodType);
        report.setPeriodValue(periodValue);
        report.setReportStatus(0);
        report.setCreateBy(createBy);
        report.setVersion(1);

        if (reportType == 1) {
            Map<String, Object> emissionData = calculationService.calculateEmission(orgId, periodType, periodValue);
            report.setTotalEmission((BigDecimal) emissionData.get("totalEmission"));
            report.setScope1Emission((BigDecimal) emissionData.get("scope1Emission"));
            report.setScope2Emission((BigDecimal) emissionData.get("scope2Emission"));
            report.setScope3Emission((BigDecimal) emissionData.get("scope3Emission"));
            report.setReportContent(buildCarbonReportContent(emissionData));
        } else {
            List<EsgIndicatorData> esgData = esgIndicatorDataService.getIndicatorDataByPeriod(orgId, periodType, periodValue);
            report.setEsgScore(calculateEsgScore(esgData));
            report.setReportContent(buildEsgReportContent(esgData));
        }

        save(report);
        return report;
    }

    private String buildCarbonReportContent(Map<String, Object> emissionData) {
        Map<String, Object> content = new HashMap<>();
        content.put("totalEmission", emissionData.get("totalEmission"));
        content.put("scope1Emission", emissionData.get("scope1Emission"));
        content.put("scope2Emission", emissionData.get("scope2Emission"));
        content.put("scope3Emission", emissionData.get("scope3Emission"));
        content.put("factorVersion", emissionData.get("factorVersion"));
        content.put("dataCount", emissionData.get("dataCount"));
        return content.toString();
    }

    private String buildEsgReportContent(List<EsgIndicatorData> esgData) {
        Map<String, Object> content = new HashMap<>();
        content.put("indicatorCount", esgData.size());
        content.put("indicators", esgData);
        content.put("esgScore", calculateEsgScore(esgData));
        return content.toString();
    }

    private BigDecimal calculateEsgScore(List<EsgIndicatorData> esgData) {
        if (esgData.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal("85.5");
    }

    public Page<Report> getReportPage(Long orgId, Integer reportType, Integer reportStatus, Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<Report> wrapper = new LambdaQueryWrapper<>();
        if (orgId != null) {
            wrapper.eq(Report::getOrgId, orgId);
        }
        if (reportType != null) {
            wrapper.eq(Report::getReportType, reportType);
        }
        if (reportStatus != null) {
            wrapper.eq(Report::getReportStatus, reportStatus);
        }
        wrapper.orderByDesc(Report::getCreateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public Report createNewVersion(Long reportId, String createBy) {
        Report oldReport = getById(reportId);
        if (oldReport == null) {
            return null;
        }

        Report newReport = new Report();
        newReport.setReportNo(oldReport.getReportNo());
        newReport.setReportName(oldReport.getReportName());
        newReport.setReportType(oldReport.getReportType());
        newReport.setOrgId(oldReport.getOrgId());
        newReport.setPeriodType(oldReport.getPeriodType());
        newReport.setPeriodValue(oldReport.getPeriodValue());
        newReport.setVersion(oldReport.getVersion() + 1);
        newReport.setParentReportId(oldReport.getId());
        newReport.setReportContent(oldReport.getReportContent());
        newReport.setReportStatus(0);
        newReport.setCreateBy(createBy);
        newReport.setCreateTime(LocalDateTime.now());
        newReport.setUpdateTime(LocalDateTime.now());

        save(newReport);
        return newReport;
    }

    public List<Report> getReportHistory(String reportNo) {
        return list(new LambdaQueryWrapper<Report>()
                .eq(Report::getReportNo, reportNo)
                .orderByDesc(Report::getVersion));
    }
}
