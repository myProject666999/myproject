package com.training.controller;

import com.training.common.Result;
import com.training.entity.Training;
import com.training.service.TrainingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/training")
public class TrainingController {

    @Autowired
    private TrainingService trainingService;

    @GetMapping("/{id}")
    public Result<Training> getById(@PathVariable Long id) {
        return trainingService.getById(id);
    }

    @GetMapping
    public Result<List<Training>> list(@RequestParam(required = false) String name,
                                       @RequestParam(required = false) Integer status) {
        return trainingService.list(name, status);
    }

    @PostMapping
    public Result<Training> add(@RequestBody Training training) {
        return trainingService.add(training);
    }

    @PutMapping
    public Result<Training> update(@RequestBody Training training) {
        return trainingService.update(training);
    }

    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id) {
        return trainingService.delete(id);
    }

    @GetMapping("/ongoing")
    public Result<List<Training>> listOngoing() {
        return trainingService.listOngoing();
    }

    @GetMapping("/ended")
    public Result<List<Training>> listEnded() {
        return trainingService.listEnded();
    }

    @GetMapping("/upcoming")
    public Result<List<Training>> listUpcoming() {
        return trainingService.listUpcoming();
    }

    @PostMapping("/{id}/qrcode")
    public Result<String> generateQrCode(@PathVariable Long id,
                                          @RequestParam(required = false) String baseUrl) {
        return trainingService.generateQrCode(id, baseUrl);
    }

    @PostMapping("/{id}/certificates/batch")
    public Result<Map<String, Object>> batchGenerateCertificates(@PathVariable Long id) {
        return trainingService.batchGenerateCertificates(id);
    }

    @GetMapping("/{id}/attendance/report")
    public Result<List<Map<String, Object>>> getAttendanceReport(@PathVariable Long id) {
        return trainingService.getAttendanceReport(id);
    }

    @GetMapping("/{id}/attendance/export")
    public void exportAttendanceReport(@PathVariable Long id, HttpServletResponse response) throws Exception {
        Result<List<Map<String, Object>>> result = trainingService.getAttendanceReport(id);
        if (result.getCode() != 200 || result.getData() == null) {
            response.sendError(500, result.getMessage());
            return;
        }
        List<Map<String, Object>> report = result.getData();
        String fileName = "签到报表_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + ".csv";
        response.setContentType("text/csv;charset=UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=" + new String(fileName.getBytes(StandardCharsets.UTF_8), StandardCharsets.ISO_8859_1));
        response.setCharacterEncoding("UTF-8");
        OutputStream out = response.getOutputStream();
        out.write(new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF});
        String header = "序号,学员ID,学员姓名,身份证号,手机号,签到次数,应签到次数,出勤率,是否合格,最后签到时间,签到方式,IP地址\n";
        out.write(header.getBytes(StandardCharsets.UTF_8));
        for (Map<String, Object> row : report) {
            StringBuilder sb = new StringBuilder();
            sb.append(row.get("index")).append(",");
            sb.append(row.get("studentId")).append(",");
            sb.append(row.get("studentName")).append(",");
            sb.append("\"").append(row.get("idCard") != null ? row.get("idCard") : "").append("\",");
            sb.append("\"").append(row.get("phone") != null ? row.get("phone") : "").append("\",");
            sb.append(row.get("checkinCount")).append(",");
            sb.append(row.get("totalSessions")).append(",");
            sb.append(row.get("attendanceRate")).append(",");
            sb.append((Boolean) row.get("isPassed") ? "合格" : "不合格").append(",");
            sb.append(row.get("lastCheckinTime")).append(",");
            sb.append(row.get("checkinType")).append(",");
            sb.append(row.get("ipAddress")).append("\n");
            out.write(sb.toString().getBytes(StandardCharsets.UTF_8));
        }
        out.flush();
        out.close();
    }
}
