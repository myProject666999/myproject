package com.market.stall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.market.stall.dto.AnnouncementDTO;
import com.market.stall.entity.Announcement;
import com.market.stall.entity.SysUser;
import com.market.stall.exception.BusinessException;
import com.market.stall.mapper.AnnouncementMapper;
import com.market.stall.mapper.SysUserMapper;
import com.market.stall.service.AnnouncementService;
import com.market.stall.vo.AnnouncementVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementMapper announcementMapper;
    private final SysUserMapper sysUserMapper;

    @Override
    public IPage<AnnouncementVO> pageAnnouncements(IPage<Announcement> page, Long eventId, Integer status) {
        LambdaQueryWrapper<Announcement> wrapper = new LambdaQueryWrapper<>();
        if (eventId != null) {
            wrapper.eq(Announcement::getEventId, eventId);
        }
        if (status != null) {
            wrapper.eq(Announcement::getStatus, status);
        }
        wrapper.orderByDesc(Announcement::getCreateTime);
        IPage<Announcement> announcementPage = announcementMapper.selectPage(page, wrapper);
        return announcementPage.convert(this::toAnnouncementVO);
    }

    @Override
    public void createAnnouncement(AnnouncementDTO dto, Long userId) {
        Announcement announcement = new Announcement();
        BeanUtils.copyProperties(dto, announcement);
        announcement.setCreateBy(userId);
        announcement.setStatus(0);
        announcementMapper.insert(announcement);
    }

    @Override
    public void publishAnnouncement(Long id) {
        Announcement announcement = announcementMapper.selectById(id);
        if (announcement == null) {
            throw new BusinessException("公告不存在");
        }
        announcement.setStatus(1);
        announcement.setPublishTime(LocalDateTime.now());
        announcementMapper.updateById(announcement);
    }

    @Override
    public void revokeAnnouncement(Long id) {
        Announcement announcement = announcementMapper.selectById(id);
        if (announcement == null) {
            throw new BusinessException("公告不存在");
        }
        announcement.setStatus(2);
        announcementMapper.updateById(announcement);
    }

    private AnnouncementVO toAnnouncementVO(Announcement announcement) {
        AnnouncementVO vo = new AnnouncementVO();
        BeanUtils.copyProperties(announcement, vo);
        if (announcement.getCreateBy() != null) {
            SysUser user = sysUserMapper.selectById(announcement.getCreateBy());
            if (user != null) {
                vo.setCreateByName(user.getRealName() != null ? user.getRealName() : user.getUsername());
            }
        }
        return vo;
    }
}
