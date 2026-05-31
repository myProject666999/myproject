package com.micro.frontend.service;

import com.micro.frontend.common.PageResult;
import com.micro.frontend.dto.ConfigPublishDTO;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.entity.RuntimeConfig;

import java.util.List;
import java.util.Map;

public interface IRuntimeConfigService {

    RuntimeConfig getById(Long id);

    RuntimeConfig getByKeyAndAppCode(String configKey, String appCode);

    PageResult<RuntimeConfig> page(PageQueryDTO query);

    List<RuntimeConfig> list(PageQueryDTO query);

    boolean save(RuntimeConfig config);

    boolean update(RuntimeConfig config);

    boolean delete(Long id);

    boolean updateStatus(Long id, Integer status);

    List<RuntimeConfig> getByAppId(Long appId);

    List<RuntimeConfig> getGlobalConfigs();

    Map<String, Object> getAllActiveConfigs();

    boolean publish(ConfigPublishDTO dto);

    boolean syncCache();

    boolean pushToClients(Long publishId);
}
