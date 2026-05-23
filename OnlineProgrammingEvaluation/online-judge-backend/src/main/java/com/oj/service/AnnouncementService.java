package com.oj.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.oj.entity.Announcement;

public interface AnnouncementService extends IService<Announcement> {
    IPage<Announcement> getAnnouncementPage(int page, int size);
    Announcement createAnnouncement(Announcement announcement);
    Announcement updateAnnouncement(Announcement announcement);
    void deleteAnnouncement(Long id);
}
