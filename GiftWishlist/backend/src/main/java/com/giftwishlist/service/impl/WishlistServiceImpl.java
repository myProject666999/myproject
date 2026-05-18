package com.giftwishlist.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.giftwishlist.entity.Wishlist;
import com.giftwishlist.mapper.WishlistMapper;
import com.giftwishlist.service.WishlistService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class WishlistServiceImpl extends ServiceImpl<WishlistMapper, Wishlist> implements WishlistService {

    @Override
    public List<Wishlist> getByUserId(Long userId) {
        QueryWrapper<Wishlist> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).orderByDesc("created_at");
        return list(wrapper);
    }
}
