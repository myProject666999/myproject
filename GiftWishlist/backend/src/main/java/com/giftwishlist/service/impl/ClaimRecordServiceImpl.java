package com.giftwishlist.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.giftwishlist.entity.ClaimRecord;
import com.giftwishlist.mapper.ClaimRecordMapper;
import com.giftwishlist.service.ClaimRecordService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ClaimRecordServiceImpl extends ServiceImpl<ClaimRecordMapper, ClaimRecord> implements ClaimRecordService {

    @Override
    public List<ClaimRecord> getByUserId(Long userId) {
        QueryWrapper<ClaimRecord> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).orderByDesc("created_at");
        return list(wrapper);
    }

    @Override
    public List<ClaimRecord> getByOwnerId(Long ownerId) {
        QueryWrapper<ClaimRecord> wrapper = new QueryWrapper<>();
        wrapper.eq("owner_id", ownerId).orderByDesc("created_at");
        return list(wrapper);
    }
}
