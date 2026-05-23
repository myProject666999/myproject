package com.oj.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.oj.common.Result;
import com.oj.entity.Announcement;
import com.oj.service.AnnouncementService;
import jakarta.annotation.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/announcement")
public class AnnouncementController {

    @Resource
    private AnnouncementService announcementService;

    @GetMapping("/list")
    public Result<IPage<Announcement>> getAnnouncementList(@RequestParam(defaultValue = "1") int page,
                                                           @RequestParam(defaultValue = "10") int size) {
        return Result.success(announcementService.getAnnouncementPage(page, size));
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Announcement> createAnnouncement(@RequestBody Announcement announcement) {
        return Result.success(announcementService.createAnnouncement(announcement));
    }

    @PutMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Announcement> updateAnnouncement(@RequestBody Announcement announcement) {
        return Result.success(announcementService.updateAnnouncement(announcement));
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<String> deleteAnnouncement(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return Result.success("删除成功");
    }
}
