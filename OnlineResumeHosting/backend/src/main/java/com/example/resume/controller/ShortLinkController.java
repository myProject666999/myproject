package com.example.resume.controller;

import com.example.resume.common.Result;
import com.example.resume.entity.ShortLink;
import com.example.resume.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/short-links")
@RequiredArgsConstructor
public class ShortLinkController {
    private final ResumeService resumeService;

    @PostMapping
    public Result<ShortLink> createShortLink(@RequestBody Map<String, Object> request) {
        Long resumeId = Long.valueOf(request.get("resumeId").toString());
        String originalUrl = request.get("originalUrl").toString();
        LocalDateTime expireAt = null;
        if (request.get("expireAt") != null) {
            expireAt = LocalDateTime.parse(request.get("expireAt").toString());
        }

        ShortLink shortLink = resumeService.createShortLink(resumeId, originalUrl, expireAt);
        return Result.success("Short link created successfully", shortLink);
    }

    @GetMapping("/{shortCode}")
    public Result<ShortLink> getShortLink(@PathVariable String shortCode) {
        return resumeService.getShortLink(shortCode)
                .map(Result::success)
                .orElse(Result.error("Short link not found or expired"));
    }

    @GetMapping("/{shortCode}/redirect")
    public Result<String> redirectToOriginalUrl(@PathVariable String shortCode) {
        return resumeService.getShortLink(shortCode)
                .map(shortLink -> Result.success(shortLink.getOriginalUrl()))
                .orElse(Result.error("Short link not found or expired"));
    }
}
