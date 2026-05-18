package com.giftwishlist.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.giftwishlist.entity.ClaimRecord;
import java.util.List;

public interface ClaimRecordService extends IService<ClaimRecord> {
    List<ClaimRecord> getByUserId(Long userId);
    List<ClaimRecord> getByOwnerId(Long ownerId);
}
