package com.micro.frontend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.micro.frontend.entity.GrayUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface GrayUserMapper extends BaseMapper<GrayUser> {

    List<GrayUser> selectByGrayReleaseId(@Param("grayReleaseId") Long grayReleaseId);

    GrayUser selectByGrayReleaseIdAndUserId(@Param("grayReleaseId") Long grayReleaseId, @Param("userId") String userId);

    int batchInsert(@Param("list") List<GrayUser> list);

    int deleteByGrayReleaseId(@Param("grayReleaseId") Long grayReleaseId);

    int deleteByGrayReleaseIdAndUserId(@Param("grayReleaseId") Long grayReleaseId, @Param("userId") String userId);
}
