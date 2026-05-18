package com.giftwishlist.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.giftwishlist.entity.Wishlist;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface WishlistMapper extends BaseMapper<Wishlist> {
}
