package com.micro.frontend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.entity.GrayRelease;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface GrayReleaseMapper extends BaseMapper<GrayRelease> {

    GrayRelease selectByGrayNo(@Param("grayNo") String grayNo);

    List<GrayRelease> selectList(PageQueryDTO query);

    Long selectCount(PageQueryDTO query);

    GrayRelease selectActiveGray(@Param("appId") Long appId);

    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

    int incrementHitCount(@Param("id") Long id);

    int incrementTotalCount(@Param("id") Long id);
}
