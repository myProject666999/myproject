package com.creator.subscription.controller;

import com.creator.subscription.common.Result;
import com.creator.subscription.dto.ContentDTO;
import com.creator.subscription.entity.Content;
import com.creator.subscription.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contents")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    @PostMapping
    public Result<Content> createContent(@RequestBody ContentDTO dto) {
        return Result.success(contentService.createContent(dto));
    }

    @GetMapping("/{contentId}")
    public Result<Content> getContent(@PathVariable Long contentId) {
        return contentService.getContent(contentId)
                .map(Result::success)
                .orElse(Result.error("内容不存在"));
    }

    @PutMapping("/{contentId}")
    public Result<Content> updateContent(@PathVariable Long contentId, @RequestBody ContentDTO dto) {
        return Result.success(contentService.updateContent(contentId, dto));
    }

    @DeleteMapping("/{contentId}")
    public Result<Void> deleteContent(@PathVariable Long contentId) {
        contentService.deleteContent(contentId);
        return Result.success();
    }

    @GetMapping("/creator/{creatorId}")
    public Result<Page<Content>> getCreatorContents(@PathVariable Long creatorId,
                                                     @RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return Result.success(contentService.getCreatorContents(creatorId, pageable));
    }

    @GetMapping("/creator/{creatorId}/accessible")
    public Result<Page<Content>> getAccessibleContents(@PathVariable Long creatorId,
                                                        @RequestParam(required = false) Long userId,
                                                        @RequestParam(defaultValue = "0") int page,
                                                        @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (userId == null) {
            userId = 0L;
        }
        return Result.success(contentService.getAccessibleContents(creatorId, userId, pageable));
    }

    @GetMapping("/creator/{creatorId}/accessible/list")
    public Result<List<Content>> getAccessibleContentsList(@PathVariable Long creatorId,
                                                            @RequestParam(required = false) Long userId) {
        if (userId == null) {
            userId = 0L;
        }
        return Result.success(contentService.getAccessibleContentsList(creatorId, userId));
    }

    @GetMapping("/{contentId}/can-access")
    public Result<Boolean> canAccessContent(@PathVariable Long contentId,
                                             @RequestParam Long userId) {
        return Result.success(contentService.canAccessContent(contentId, userId));
    }

    @PostMapping("/{contentId}/view")
    public Result<Void> incrementViewCount(@PathVariable Long contentId) {
        contentService.incrementViewCount(contentId);
        return Result.success();
    }
}
