package com.micro.frontend.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.micro.frontend.common.PageResult;
import com.micro.frontend.dto.ConfigPublishDTO;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.entity.ConfigPublish;
import com.micro.frontend.entity.RuntimeConfig;
import com.micro.frontend.mapper.RuntimeConfigMapper;
import com.micro.frontend.service.IConfigPublishService;
import com.micro.frontend.service.IRuntimeConfigService;
import com.micro.frontend.websocket.WebSocketPushService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class RuntimeConfigServiceImpl implements IRuntimeConfigService {

    private static final Logger log = LoggerFactory.getLogger(RuntimeConfigServiceImpl.class);

    @Autowired
    private RuntimeConfigMapper runtimeConfigMapper;

    @Autowired
    private IConfigPublishService configPublishService;

    @Autowired
    private WebSocketPushService webSocketPushService;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private final Map<String, Object> configCache = new ConcurrentHashMap<>();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public RuntimeConfig getById(Long id) {
        return runtimeConfigMapper.selectById(id);
    }

    @Override
    public RuntimeConfig getByKeyAndAppCode(String configKey, String appCode) {
        return runtimeConfigMapper.selectByKeyAndAppCode(configKey, appCode);
    }

    @Override
    public PageResult<RuntimeConfig> page(PageQueryDTO query) {
        List<RuntimeConfig> list = runtimeConfigMapper.selectList(query);
        Long total = runtimeConfigMapper.selectCount(query);
        return PageResult.of(list, total, query.getPageNum(), query.getPageSize());
    }

    @Override
    public List<RuntimeConfig> list(PageQueryDTO query) {
        return runtimeConfigMapper.selectList(query);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean save(RuntimeConfig config) {
        RuntimeConfig exist = runtimeConfigMapper.selectByKeyAndAppCode(
                config.getConfigKey(), config.getAppCode());
        if (exist != null) {
            throw new RuntimeException("配置键已存在");
        }
        config.setVersion(1);
        config.setCreatedAt(LocalDateTime.now());
        config.setUpdatedAt(LocalDateTime.now());
        config.setDeleted(0);
        return runtimeConfigMapper.insert(config) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean update(RuntimeConfig config) {
        RuntimeConfig exist = runtimeConfigMapper.selectById(config.getId());
        if (exist == null) {
            throw new RuntimeException("配置不存在");
        }
        config.setVersion(exist.getVersion() + 1);
        config.setUpdatedAt(LocalDateTime.now());
        return runtimeConfigMapper.updateById(config) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean delete(Long id) {
        return runtimeConfigMapper.deleteById(id) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateStatus(Long id, Integer status) {
        return runtimeConfigMapper.updateStatus(id, status) > 0;
    }

    @Override
    public List<RuntimeConfig> getByAppId(Long appId) {
        return runtimeConfigMapper.selectByAppId(appId);
    }

    @Override
    public List<RuntimeConfig> getGlobalConfigs() {
        return runtimeConfigMapper.selectGlobalConfigs();
    }

    @Override
    public Map<String, Object> getAllActiveConfigs() {
        if (!configCache.isEmpty()) {
            return new HashMap<>(configCache);
        }
        syncCache();
        return new HashMap<>(configCache);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean publish(ConfigPublishDTO dto) {
        Map<String, Object> allConfigs = getAllActiveConfigs();
        String configSnapshot;
        try {
            configSnapshot = objectMapper.writeValueAsString(allConfigs);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("配置序列化失败", e);
        }
        ConfigPublish publish = configPublishService.createPublishRecord(dto, configSnapshot);
        if (publish == null) {
            throw new RuntimeException("创建发布记录失败");
        }
        syncCache();
        pushToClients(publish.getId());
        return true;
    }

    @Override
    public boolean syncCache() {
        List<RuntimeConfig> configs = runtimeConfigMapper.selectAllActiveConfigs();
        configCache.clear();
        for (RuntimeConfig config : configs) {
            String key = config.getIsGlobal() == 1 ? config.getConfigKey()
                    : (config.getAppCode() + ":" + config.getConfigKey());
            Object value = parseConfigValue(config.getConfigValue(), config.getConfigType());
            configCache.put(key, value);
            try {
                String redisKey = "micro_frontend:config:" + key;
                redisTemplate.opsForValue().set(redisKey, value, 1, TimeUnit.DAYS);
            } catch (Exception e) {
                log.warn("同步配置到Redis失败, key: {}, error: {}", key, e.getMessage());
            }
        }
        log.info("配置缓存同步完成, 共 {} 条配置", configCache.size());
        return true;
    }

    private Object parseConfigValue(String value, String type) {
        try {
            switch (type) {
                case "number":
                    return Long.parseLong(value);
                case "boolean":
                    return Boolean.parseBoolean(value);
                case "json":
                    return objectMapper.readValue(value, Object.class);
                default:
                    return value;
            }
        } catch (Exception e) {
            return value;
        }
    }

    @Override
    public boolean pushToClients(Long publishId) {
        try {
            ConfigPublish publish = configPublishService.getById(publishId);
            if (publish == null) {
                log.warn("发布记录不存在, publishId: {}", publishId);
                return false;
            }

            configPublishService.updateStatus(publishId, 1);
            configPublishService.updatePushStatus(publishId, 1);
            log.info("开始推送配置变更, publishId: {}, appCode: {}", publishId, publish.getAppCode());

            webSocketPushService.pushConfigChange(publishId, publish.getAppCode());

            configPublishService.updateStatus(publishId, 2);
            configPublishService.updatePushStatus(publishId, 2);
            configPublishService.updatePublishTime(publishId, LocalDateTime.now());
            log.info("配置变更推送完成, publishId: {}", publishId);

            return true;
        } catch (Exception e) {
            log.error("推送配置变更失败, publishId: {}", publishId, e);
            configPublishService.updateStatus(publishId, 3);
            configPublishService.updatePushStatus(publishId, 3);
            return false;
        }
    }
}
