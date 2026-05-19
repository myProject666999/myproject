package com.mindmap.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mindmap.entity.Share;
import com.mindmap.mapper.ShareMapper;
import com.mindmap.service.ShareService;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ShareServiceImpl extends ServiceImpl<ShareMapper, Share> implements ShareService {

    @Override
    public Share createShare(Long mindmapId) {
        Share share = new Share();
        share.setMindmapId(mindmapId);
        share.setShareCode(UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        share.setViewCount(0);
        save(share);
        return share;
    }

    @Override
    public Share getByShareCode(String shareCode) {
        LambdaQueryWrapper<Share> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Share::getShareCode, shareCode);
        return getOne(wrapper);
    }

    @Override
    public boolean incrementViewCount(Long id) {
        Share share = getById(id);
        if (share != null) {
            share.setViewCount(share.getViewCount() + 1);
            return updateById(share);
        }
        return false;
    }
}
