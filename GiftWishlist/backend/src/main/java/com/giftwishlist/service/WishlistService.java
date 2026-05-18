package com.giftwishlist.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.giftwishlist.entity.Wishlist;
import java.util.List;

public interface WishlistService extends IService<Wishlist> {
    List<Wishlist> getByUserId(Long userId);
}
