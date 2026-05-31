package com.micro.frontend.service.impl;

import com.micro.frontend.common.PageResult;
import com.micro.frontend.dto.ConfigPublishDTO;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.entity.ConfigPublish;
import com.micro.frontend.mapper.ConfigPublishMapper;
import com.micro.frontend.service.IConfigPublishService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class ConfigPublishServiceImpl implements IConfigPublishService {

    @Autowired
    private ConfigPublishMapper configPublishMapper;

    @Override
    public ConfigPublish getById(Long id) {
        return configPublishMapper.selectById(id);
    }

    @Override
    public ConfigPublish getByPublishNo(String publishNo) {
        return configPublishMapper.selectByPublishNo(publishNo);
    }

    @Override
    public PageResult<ConfigPublish> page(PageQueryDTO query) {
        List<ConfigPublish> list = configPublishMapper.selectList(query);
        Long total = configPublishMapper.selectCount(query);
        return PageResult.of(list, total, query.getPageNum(), query.getPageSize());
    }

    @Override
    public List<ConfigPublish> getByAppId(Long appId) {
        return configPublishMapper.selectByAppId(appId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean create(ConfigPublish publish) {
        if (publish.getPublishNo() == null) {
            publish.setPublishNo(generatePublishNo());
        }
        publish.setCreatedAt(LocalDateTime.now());
        return configPublishMapper.insert(publish) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean update(ConfigPublish publish) {
        return configPublishMapper.updateById(publish) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateStatus(Long id, Integer status) {
        return configPublishMapper.updateStatus(id, status) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updatePushStatus(Long id, Integer pushStatus) {
        return configPublishMapper.updatePushStatus(id, pushStatus) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updatePublishTime(Long id, LocalDateTime publishTime) {
        configPublishMapper.updatePublishTime(id, publishTime);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ConfigPublish createPublishRecord(ConfigPublishDTO dto, String configSnapshot) {
        ConfigPublish publish = new ConfigPublish();
        BeanUtils.copyProperties(dto, publish);
        publish.setPublishNo(generatePublishNo());
        publish.setConfigSnapshot(configSnapshot);
        publish.setStatus(0);
        publish.setPushStatus(0);
        publish.setAffectedClients(0);
        publish.setPublishTime(LocalDateTime.now());
        publish.setCreatedAt(LocalDateTime.now());
        int result = configPublishMapper.insert(publish);
        return result > 0 ? publish : null;
    }

    @Override
    public String generatePublishNo() {
        return "PUB" + System.currentTimeMillis() + new Random().nextInt(1000);
    }
}
