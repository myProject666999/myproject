package com.mindmap.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mindmap.entity.Share;

public interface ShareService extends IService<Share> {
    Share createShare(Long mindmapId);
    Share getByShareCode(String shareCode);
    boolean incrementViewCount(Long id);
}
