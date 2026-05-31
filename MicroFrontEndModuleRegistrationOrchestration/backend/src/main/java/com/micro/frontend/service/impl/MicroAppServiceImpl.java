package com.micro.frontend.service.impl;

import com.micro.frontend.common.PageResult;
import com.micro.frontend.dto.AppRegisterDTO;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.dto.VersionPublishDTO;
import com.micro.frontend.entity.AppVersion;
import com.micro.frontend.entity.MicroApp;
import com.micro.frontend.mapper.AppVersionMapper;
import com.micro.frontend.mapper.MicroAppMapper;
import com.micro.frontend.service.IMicroAppService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MicroAppServiceImpl implements IMicroAppService {

    @Autowired
    private MicroAppMapper microAppMapper;

    @Autowired
    private AppVersionMapper appVersionMapper;

    @Override
    public MicroApp getById(Long id) {
        return microAppMapper.selectById(id);
    }

    @Override
    public MicroApp getByAppCode(String appCode) {
        return microAppMapper.selectByAppCode(appCode);
    }

    @Override
    public PageResult<MicroApp> page(PageQueryDTO query) {
        List<MicroApp> list = microAppMapper.selectList(query);
        Long total = microAppMapper.selectCount(query);
        return PageResult.of(list, total, query.getPageNum(), query.getPageSize());
    }

    @Override
    public List<MicroApp> list(PageQueryDTO query) {
        return microAppMapper.selectList(query);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean register(AppRegisterDTO dto) {
        MicroApp exist = microAppMapper.selectByAppCode(dto.getAppCode());
        if (exist != null) {
            throw new RuntimeException("应用编码已存在");
        }
        MicroApp app = new MicroApp();
        BeanUtils.copyProperties(dto, app);
        app.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        app.setDeleted(0);
        app.setCreatedAt(LocalDateTime.now());
        app.setUpdatedAt(LocalDateTime.now());
        return microAppMapper.insert(app) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean update(AppRegisterDTO dto) {
        MicroApp app = microAppMapper.selectById(dto.getId());
        if (app == null) {
            throw new RuntimeException("应用不存在");
        }
        if (!app.getAppCode().equals(dto.getAppCode())) {
            MicroApp exist = microAppMapper.selectByAppCode(dto.getAppCode());
            if (exist != null) {
                throw new RuntimeException("应用编码已存在");
            }
        }
        BeanUtils.copyProperties(dto, app);
        app.setUpdatedAt(LocalDateTime.now());
        return microAppMapper.updateById(app) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean delete(Long id) {
        return microAppMapper.deleteById(id) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean offline(Long id) {
        return microAppMapper.updateStatus(id, 0) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean online(Long id) {
        return microAppMapper.updateStatus(id, 1) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean publishVersion(VersionPublishDTO dto) {
        MicroApp app = microAppMapper.selectById(dto.getAppId());
        if (app == null) {
            throw new RuntimeException("应用不存在");
        }
        AppVersion version = new AppVersion();
        BeanUtils.copyProperties(dto, version);
        version.setIsActive(0);
        version.setPublishTime(LocalDateTime.now());
        version.setCreatedAt(LocalDateTime.now());
        version.setDeleted(0);
        int result = appVersionMapper.insert(version);
        if (result > 0) {
            appVersionMapper.deactivateAllByAppId(dto.getAppId());
            appVersionMapper.activateVersion(version.getId());
            microAppMapper.updateCurrentVersion(dto.getAppId(), dto.getVersion());
        }
        return result > 0;
    }

    @Override
    public List<AppVersion> getVersionList(Long appId) {
        return appVersionMapper.selectByAppId(appId);
    }

    @Override
    public AppVersion getActiveVersion(Long appId) {
        return appVersionMapper.selectActiveVersion(appId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteVersion(Long versionId) {
        return appVersionMapper.deleteById(versionId) > 0;
    }
}
