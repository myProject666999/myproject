package com.market.stall.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.market.stall.dto.AnnouncementDTO;
import com.market.stall.entity.Announcement;
import com.market.stall.vo.AnnouncementVO;

public interface AnnouncementService {

    IPage<AnnouncementVO> pageAnnouncements(IPage<Announcement> page, Long eventId, Integer status);

    void createAnnouncement(AnnouncementDTO dto, Long userId);

    void publishAnnouncement(Long id);

    void revokeAnnouncement(Long id);
}
