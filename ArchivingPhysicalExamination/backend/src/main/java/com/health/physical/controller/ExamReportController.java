package com.health.physical.controller;

import com.health.physical.common.Result;
import com.health.physical.entity.ExamReport;
import com.health.physical.entity.ExamIndicator;
import com.health.physical.service.ExamReportService;
import com.health.physical.vo.ReportDetailVO;
import com.health.physical.vo.ReportListVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/report")
public class ExamReportController {

    @Autowired
    private ExamReportService examReportService;

    @Value("${file.upload-path}")
    private String uploadPath;

    @GetMapping("/list")
    public Result<List<ReportListVO>> getReportList(@RequestParam Long userId) {
        return Result.success(examReportService.getReportList(userId));
    }

    @GetMapping("/detail/{id}")
    public Result<ReportDetailVO> getReportDetail(@PathVariable Long id) {
        ReportDetailVO vo = examReportService.getReportDetail(id);
        if (vo == null) {
            return Result.error("报告不存在");
        }
        return Result.success(vo);
    }

    @PostMapping("/add")
    public Result<Boolean> addReport(@RequestBody ExamReport report) {
        boolean saved = examReportService.save(report);
        return Result.success(saved);
    }

    @PostMapping("/addWithIndicators")
    public Result<Boolean> addReportWithIndicators(@RequestBody ReportWithIndicatorsDTO dto) {
        boolean saved = examReportService.saveReportWithIndicators(dto.getReport(), dto.getIndicators());
        return Result.success(saved);
    }

    @PutMapping("/update")
    public Result<Boolean> updateReport(@RequestBody ExamReport report) {
        boolean updated = examReportService.updateById(report);
        return Result.success(updated);
    }

    @DeleteMapping("/delete/{id}")
    public Result<Boolean> deleteReport(@PathVariable Long id) {
        boolean deleted = examReportService.deleteReport(id);
        return Result.success(deleted);
    }

    @GetMapping("/years")
    public Result<List<Integer>> getAvailableYears(@RequestParam Long userId) {
        return Result.success(examReportService.getAvailableYears(userId));
    }

    @PostMapping("/upload")
    public Result<String> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error("请选择文件");
        }

        try {
            File dir = new File(uploadPath);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String originalFilename = file.getOriginalFilename();
            String ext = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
            String newFilename = UUID.randomUUID().toString().replace("-", "") + ext;

            File dest = new File(dir, newFilename);
            file.transferTo(dest);

            return Result.success(dest.getAbsolutePath());
        } catch (IOException e) {
            return Result.error("文件上传失败: " + e.getMessage());
        }
    }

    public static class ReportWithIndicatorsDTO {
        private ExamReport report;
        private List<ExamIndicator> indicators;

        public ExamReport getReport() {
            return report;
        }

        public void setReport(ExamReport report) {
            this.report = report;
        }

        public List<ExamIndicator> getIndicators() {
            return indicators;
        }

        public void setIndicators(List<ExamIndicator> indicators) {
            this.indicators = indicators;
        }
    }
}
