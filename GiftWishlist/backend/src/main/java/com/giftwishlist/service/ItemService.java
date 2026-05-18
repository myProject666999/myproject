package com.giftwishlist.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.giftwishlist.entity.Item;
import java.util.List;

public interface ItemService extends IService<Item> {
    List<Item> getByWishlistId(Long wishlistId);
    boolean claimItem(Long itemId, Long userId, Long ownerId, String message);
}
