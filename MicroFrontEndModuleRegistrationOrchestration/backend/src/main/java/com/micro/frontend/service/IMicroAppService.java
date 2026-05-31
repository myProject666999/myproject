package com.micro.frontend.service;

import com.micro.frontend.common.PageResult;
import com.micro.frontend.dto.AppRegisterDTO;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.dto.VersionPublishDTO;
import com.micro.frontend.entity.AppVersion;
import com.micro.frontend.entity.MicroApp;

import java.util.List;

public interface IMicroAppService {

    MicroApp getById(Long id);

    MicroApp getByAppCode(String appCode);

    PageResult<MicroApp> page(PageQueryDTO query);

    List<MicroApp> list(PageQueryDTO query);

    boolean register(AppRegisterDTO dto);

    boolean update(AppRegisterDTO dto);

    boolean delete(Long id);

    boolean offline(Long id);

    boolean online(Long id);

    boolean publishVersion(VersionPublishDTO dto);

    List<AppVersion> getVersionList(Long appId);

    AppVersion getActiveVersion(Long appId);

    boolean deleteVersion(Long versionId);
}
