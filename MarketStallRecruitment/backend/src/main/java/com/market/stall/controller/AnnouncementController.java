package com.market.stall.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.market.stall.common.PageResult;
import com.market.stall.common.Result;
import com.market.stall.dto.AnnouncementDTO;
import com.market.stall.entity.Announcement;
import com.market.stall.service.AnnouncementService;
import com.market.stall.vo.AnnouncementVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/announcement")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    private Long getCurrentUserId() {
        Object principal = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        if (principal instanceof Long) {
            return (Long) principal;
        }
        return Long.parseLong(principal.toString());
    }

    @GetMapping("/page")
    public Result<PageResult<AnnouncementVO>> page(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam Long eventId,
            @RequestParam(required = false) Integer status) {
        IPage<Announcement> page = new Page<>(pageNum, pageSize);
        return Result.success(new PageResult<>(announcementService.pageAnnouncements(page, eventId, status)));
    }

    @PostMapping
    public Result<Void> create(@RequestBody @Valid AnnouncementDTO dto) {
        announcementService.createAnnouncement(dto, getCurrentUserId());
        return Result.success();
    }

    @PutMapping("/{id}/publish")
    public Result<Void> publish(@PathVariable Long id) {
        announcementService.publishAnnouncement(id);
        return Result.success();
    }

    @PutMapping("/{id}/revoke")
    public Result<Void> revoke(@PathVariable Long id) {
        announcementService.revokeAnnouncement(id);
        return Result.success();
    }
}
