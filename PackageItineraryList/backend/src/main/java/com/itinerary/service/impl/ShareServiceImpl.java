package com.itinerary.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.itinerary.entity.Share;
import com.itinerary.mapper.ShareMapper;
import com.itinerary.service.ShareService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class ShareServiceImpl extends ServiceImpl<ShareMapper, Share> implements ShareService {

    @Override
    public Share createShare(Long itineraryId, Long userId, boolean canEdit, Integer expireDays) {
        Share share = new Share();
        share.setItineraryId(itineraryId);
        share.setUserId(userId);
        share.setShareCode(generateShareCode());
        share.setShareUrl("/share/" + share.getShareCode());
        share.setCanEdit(canEdit ? 1 : 0);
        if (expireDays != null && expireDays > 0) {
            share.setExpireAt(LocalDateTime.now().plusDays(expireDays));
        }
        share.setExpired(0);
        save(share);
        return share;
    }

    @Override
    public Share getShareByCode(String shareCode) {
        LambdaQueryWrapper<Share> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Share::getShareCode, shareCode)
                .eq(Share::getExpired, 0);
        Share share = getOne(wrapper);
        if (share != null && share.getExpireAt() != null && share.getExpireAt().isBefore(LocalDateTime.now())) {
            share.setExpired(1);
            updateById(share);
            return null;
        }
        return share;
    }

    @Override
    public Share joinShare(String shareCode, String nickname) {
        Share share = getShareByCode(shareCode);
        if (share == null) {
            throw new RuntimeException("分享链接无效或已过期");
        }
        return share;
    }

    private String generateShareCode() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }
}
