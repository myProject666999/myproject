package com.oj.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.oj.entity.SystemConfig;

import java.util.List;

public interface SystemConfigService extends IService<SystemConfig> {
    List<SystemConfig> getAllConfigs();
    SystemConfig getConfig(String key);
    void updateConfig(SystemConfig config);
}
