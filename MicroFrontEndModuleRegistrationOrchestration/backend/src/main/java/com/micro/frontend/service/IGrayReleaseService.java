package com.micro.frontend.service;

import com.micro.frontend.common.PageResult;
import com.micro.frontend.dto.GrayCreateDTO;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.entity.GrayRelease;

import java.util.Map;

public interface IGrayReleaseService {

    GrayRelease getById(Long id);

    GrayRelease getByGrayNo(String grayNo);

    PageResult<GrayRelease> page(PageQueryDTO query);

    boolean create(GrayCreateDTO dto);

    boolean update(GrayRelease gray);

    boolean delete(Long id);

    boolean start(Long id);

    boolean pause(Long id);

    boolean full(Long id);

    boolean rollback(Long id);

    GrayRelease getActiveGray(Long appId);

    Map<String, Object> judge(Long appId, String userId, String userType);

    boolean incrementHitCount(Long id);

    boolean incrementTotalCount(Long id);
}
