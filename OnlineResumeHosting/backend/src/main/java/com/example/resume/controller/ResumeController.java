package com.example.resume.controller;

import com.example.resume.common.Result;
import com.example.resume.entity.Resume;
import com.example.resume.service.ResumeService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {
    private final ResumeService resumeService;

    @GetMapping
    public Result<List<Resume>> getUserResumes(@RequestParam Long userId) {
        return Result.success(resumeService.getUserResumes(userId));
    }

    @GetMapping("/public")
    public Result<List<Resume>> getPublicResumes() {
        return Result.success(resumeService.getPublicResumes());
    }

    @GetMapping("/{id}")
    public Result<Resume> getResumeById(@PathVariable Long id) {
        return resumeService.getResumeById(id)
                .map(Result::success)
                .orElse(Result.error("Resume not found"));
    }

    @PostMapping
    public Result<Resume> createResume(@RequestBody Resume resume) {
        Resume created = resumeService.createResume(resume);
        return Result.success("Resume created successfully", created);
    }

    @PutMapping("/{id}")
    public Result<Resume> updateResume(@PathVariable Long id, @RequestBody Resume resume) {
        Resume updated = resumeService.updateResume(id, resume);
        return Result.success("Resume updated successfully", updated);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteResume(@PathVariable Long id) {
        resumeService.deleteResume(id);
        return Result.success("Resume deleted successfully", null);
    }

    @PostMapping("/{id}/view")
    public Result<Void> incrementViewCount(@PathVariable Long id) {
        resumeService.incrementViewCount(id);
        return Result.success();
    }

    @PostMapping("/{id}/visit")
    public Result<Void> recordVisit(@PathVariable Long id, HttpServletRequest request) {
        resumeService.recordVisit(id, request);
        return Result.success();
    }

    @GetMapping("/{id}/export-pdf")
    public ResponseEntity<byte[]> exportResumeToPdf(@PathVariable Long id) {
        try {
            byte[] pdfBytes = resumeService.exportResumeToPdf(id);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "resume_" + id + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{id}/short-link")
    public Result<com.example.resume.entity.ShortLink> createShortLink(@PathVariable Long id, HttpServletRequest request) {
        String originalUrl = request.getHeader("Origin") + "/resume/preview/" + id;
        com.example.resume.entity.ShortLink shortLink = resumeService.createShortLink(id, originalUrl, null);
        return Result.success(shortLink);
    }
}
