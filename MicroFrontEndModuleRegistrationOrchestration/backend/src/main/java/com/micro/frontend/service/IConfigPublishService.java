package com.micro.frontend.service;

import com.micro.frontend.common.PageResult;
import com.micro.frontend.dto.ConfigPublishDTO;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.entity.ConfigPublish;

import java.time.LocalDateTime;
import java.util.List;

public interface IConfigPublishService {

    ConfigPublish getById(Long id);

    ConfigPublish getByPublishNo(String publishNo);

    PageResult<ConfigPublish> page(PageQueryDTO query);

    List<ConfigPublish> getByAppId(Long appId);

    boolean create(ConfigPublish publish);

    boolean update(ConfigPublish publish);

    boolean updateStatus(Long id, Integer status);

    boolean updatePushStatus(Long id, Integer pushStatus);

    void updatePublishTime(Long id, LocalDateTime publishTime);

    ConfigPublish createPublishRecord(ConfigPublishDTO dto, String configSnapshot);

    String generatePublishNo();
}
