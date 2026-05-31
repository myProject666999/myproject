package com.micro.frontend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.entity.AppVersion;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AppVersionMapper extends BaseMapper<AppVersion> {

    List<AppVersion> selectByAppId(@Param("appId") Long appId);

    AppVersion selectByAppIdAndVersion(@Param("appId") Long appId, @Param("version") String version);

    AppVersion selectActiveVersion(@Param("appId") Long appId);

    List<AppVersion> selectList(PageQueryDTO query);

    Long selectCount(PageQueryDTO query);

    int setActive(@Param("appId") Long appId, @Param("id") Long id);

    int deactivateAllByAppId(@Param("appId") Long appId);

    int activateVersion(@Param("id") Long id);
}
