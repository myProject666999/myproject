package com.example.complaint.controller;

import com.example.complaint.common.Result;
import com.example.complaint.dto.ComplaintDetailDTO;
import com.example.complaint.dto.ComplaintSubmitDTO;
import com.example.complaint.entity.Complaint;
import com.example.complaint.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    public Result<Complaint> submitComplaint(
            @RequestParam("title") String title,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "area", required = false) String area,
            @RequestParam("content") String content,
            @RequestParam(value = "contactName", required = false) String contactName,
            @RequestParam(value = "contactPhone", required = false) String contactPhone,
            @RequestParam(value = "files", required = false) List<MultipartFile> files) {
        try {
            ComplaintSubmitDTO dto = new ComplaintSubmitDTO();
            dto.setTitle(title);
            dto.setCategoryId(categoryId);
            dto.setArea(area);
            dto.setContent(content);
            dto.setContactName(contactName);
            dto.setContactPhone(contactPhone);
            Complaint complaint = complaintService.submitComplaint(dto, files);
            return Result.success(complaint);
        } catch (Exception e) {
            return Result.error("提交失败: " + e.getMessage());
        }
    }

    @GetMapping("/my")
    public Result<List<Complaint>> getMyComplaints(@RequestParam("phone") String phone) {
        return Result.success(complaintService.getMyComplaints(phone));
    }

    @GetMapping("/{id}")
    public Result<ComplaintDetailDTO> getDetail(@PathVariable Long id) {
        ComplaintDetailDTO detail = complaintService.getDetail(id);
        if (detail == null) {
            return Result.error("投诉不存在");
        }
        return Result.success(detail);
    }

    @PostMapping("/{id}/evaluate")
    public Result<Void> evaluate(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Integer rating = body.get("rating") == null ? null : ((Number) body.get("rating")).intValue();
        String feedback = body.get("feedback") == null ? null : body.get("feedback").toString();
        boolean ok = complaintService.evaluateComplaint(id, rating, feedback);
        if (!ok) {
            return Result.error("评价失败，请检查评分(1-5)");
        }
        return Result.success();
    }
}
