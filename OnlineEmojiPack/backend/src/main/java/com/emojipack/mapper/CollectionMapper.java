package com.emojipack.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.emojipack.entity.Collection;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CollectionMapper extends BaseMapper<Collection> {

    IPage<Collection> selectPageWithDetail(Page<Collection> page,
                                           @Param("keyword") String keyword,
                                           @Param("userId") Long userId,
                                           @Param("isPublic") Integer isPublic);
}
