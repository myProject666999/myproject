package com.itinerary.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.itinerary.entity.Share;

public interface ShareService extends IService<Share> {
    Share createShare(Long itineraryId, Long userId, boolean canEdit, Integer expireDays);
    Share getShareByCode(String shareCode);
    Share joinShare(String shareCode, String nickname);
}
