package com.oj.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.oj.entity.SystemConfig;
import com.oj.mapper.SystemConfigMapper;
import com.oj.service.SystemConfigService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SystemConfigServiceImpl extends ServiceImpl<SystemConfigMapper, SystemConfig> implements SystemConfigService {

    @Override
    public List<SystemConfig> getAllConfigs() {
        return this.list();
    }

    @Override
    public SystemConfig getConfig(String key) {
        return this.getById(key);
    }

    @Override
    public void updateConfig(SystemConfig config) {
        this.saveOrUpdate(config);
    }
}
