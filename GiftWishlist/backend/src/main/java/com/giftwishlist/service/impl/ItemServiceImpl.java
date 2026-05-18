package com.giftwishlist.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.giftwishlist.entity.ClaimRecord;
import com.giftwishlist.entity.Item;
import com.giftwishlist.mapper.ClaimRecordMapper;
import com.giftwishlist.mapper.ItemMapper;
import com.giftwishlist.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ItemServiceImpl extends ServiceImpl<ItemMapper, Item> implements ItemService {

    @Autowired
    private ClaimRecordMapper claimRecordMapper;

    @Override
    public List<Item> getByWishlistId(Long wishlistId) {
        QueryWrapper<Item> wrapper = new QueryWrapper<>();
        wrapper.eq("wishlist_id", wishlistId).orderByDesc("priority", "created_at");
        return list(wrapper);
    }

    @Override
    @Transactional
    public boolean claimItem(Long itemId, Long userId, Long ownerId, String message) {
        Item item = getById(itemId);
        if (item == null || item.getIsClaimed() == 1) {
            return false;
        }
        item.setIsClaimed(1);
        updateById(item);

        ClaimRecord record = new ClaimRecord();
        record.setItemId(itemId);
        record.setUserId(userId);
        record.setOwnerId(ownerId);
        record.setMessage(message);
        record.setIsPurchased(0);
        record.setCreatedAt(LocalDateTime.now());
        claimRecordMapper.insert(record);

        return true;
    }
}
