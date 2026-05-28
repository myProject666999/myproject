package com.school.cafeteria.controller;

import com.school.cafeteria.common.Result;
import com.school.cafeteria.entity.Announcement;
import com.school.cafeteria.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/announcement")
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    @GetMapping("/public/list")
    public Result<List<Announcement>> getPublished() {
        List<Announcement> list = announcementService.findAllPublished();
        return Result.success(list);
    }

    @GetMapping("/public/{id}")
    public Result<Announcement> getById(@PathVariable Long id) {
        Optional<Announcement> announcement = announcementService.findById(id);
        return announcement.map(Result::success).orElse(Result.error("公告不存在"));
    }

    @GetMapping("/list")
    public Result<List<Announcement>> getAll() {
        List<Announcement> list = announcementService.findAll();
        return Result.success(list);
    }

    @PostMapping
    public Result<Announcement> create(@RequestBody Announcement announcement) {
        Announcement saved = announcementService.save(announcement);
        return Result.success("发布成功", saved);
    }

    @PutMapping("/{id}")
    public Result<Announcement> update(@PathVariable Long id, @RequestBody Announcement announcement) {
        Optional<Announcement> existing = announcementService.findById(id);
        if (!existing.isPresent()) {
            return Result.error("公告不存在");
        }
        announcement.setId(id);
        Announcement saved = announcementService.save(announcement);
        return Result.success("更新成功", saved);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        announcementService.delete(id);
        return Result.success();
    }
}
