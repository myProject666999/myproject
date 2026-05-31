package com.micro.frontend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.entity.AppDependency;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AppDependencyMapper extends BaseMapper<AppDependency> {

    List<AppDependency> selectByAppId(@Param("appId") Long appId);

    List<AppDependency> selectByAppIdAndVersion(@Param("appId") Long appId, @Param("version") String version);

    List<AppDependency> selectByDependencyCode(@Param("dependencyCode") String dependencyCode);

    List<AppDependency> selectList(PageQueryDTO query);

    Long selectCount(PageQueryDTO query);

    int deleteByAppIdAndVersion(@Param("appId") Long appId, @Param("version") String version);

    List<AppDependency> selectByAppVersionId(@Param("appVersionId") Long appVersionId);

    int deleteByAppVersionId(@Param("appVersionId") Long appVersionId);
}
