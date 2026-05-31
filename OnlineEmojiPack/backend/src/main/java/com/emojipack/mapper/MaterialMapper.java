package com.emojipack.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.emojipack.entity.Material;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MaterialMapper extends BaseMapper<Material> {

    IPage<Material> selectPageWithDetail(Page<Material> page,
                                          @Param("keyword") String keyword,
                                          @Param("categoryId") Long categoryId,
                                          @Param("tagId") Long tagId,
                                          @Param("uploaderId") Long uploaderId,
                                          @Param("sort") String sort);
}
