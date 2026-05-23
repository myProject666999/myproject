package com.oj.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.oj.entity.Announcement;
import com.oj.mapper.AnnouncementMapper;
import com.oj.service.AnnouncementService;
import org.springframework.stereotype.Service;

@Service
public class AnnouncementServiceImpl extends ServiceImpl<AnnouncementMapper, Announcement> implements AnnouncementService {

    @Override
    public IPage<Announcement> getAnnouncementPage(int page, int size) {
        Page<Announcement> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Announcement> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(Announcement::getPriority);
        wrapper.orderByDesc(Announcement::getCreateTime);
        return this.page(pageParam, wrapper);
    }

    @Override
    public Announcement createAnnouncement(Announcement announcement) {
        if (announcement.getPriority() == null) announcement.setPriority(0);
        this.save(announcement);
        return announcement;
    }

    @Override
    public Announcement updateAnnouncement(Announcement announcement) {
        this.updateById(announcement);
        return announcement;
    }

    @Override
    public void deleteAnnouncement(Long id) {
        this.removeById(id);
    }
}
