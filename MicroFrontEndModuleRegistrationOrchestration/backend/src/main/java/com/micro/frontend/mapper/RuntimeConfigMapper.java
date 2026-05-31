package com.micro.frontend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.entity.RuntimeConfig;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RuntimeConfigMapper extends BaseMapper<RuntimeConfig> {

    RuntimeConfig selectByKeyAndAppCode(@Param("configKey") String configKey, @Param("appCode") String appCode);

    List<RuntimeConfig> selectList(PageQueryDTO query);

    Long selectCount(PageQueryDTO query);

    List<RuntimeConfig> selectByAppId(@Param("appId") Long appId);

    List<RuntimeConfig> selectGlobalConfigs();

    List<RuntimeConfig> selectAllActiveConfigs();

    int updateStatus(@Param("id") Long id, @Param("status") Integer status);
}
