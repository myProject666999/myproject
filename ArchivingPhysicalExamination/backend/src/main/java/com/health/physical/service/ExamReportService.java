package com.health.physical.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.health.physical.entity.ExamReport;
import com.health.physical.vo.ReportDetailVO;
import com.health.physical.vo.ReportListVO;
import java.util.List;

public interface ExamReportService extends IService<ExamReport> {

    List<ReportListVO> getReportList(Long userId);

    ReportDetailVO getReportDetail(Long reportId);

    boolean saveReportWithIndicators(ExamReport report, List<com.health.physical.entity.ExamIndicator> indicators);

    boolean deleteReport(Long reportId);

    List<Integer> getAvailableYears(Long userId);
}
