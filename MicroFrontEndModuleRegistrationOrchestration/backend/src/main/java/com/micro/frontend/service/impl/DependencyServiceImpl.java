package com.micro.frontend.service.impl;

import com.micro.frontend.entity.AppDependency;
import com.micro.frontend.entity.AppVersion;
import com.micro.frontend.mapper.AppDependencyMapper;
import com.micro.frontend.mapper.AppVersionMapper;
import com.micro.frontend.mapper.MicroAppMapper;
import com.micro.frontend.service.IDependencyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DependencyServiceImpl implements IDependencyService {

    @Autowired
    private AppDependencyMapper appDependencyMapper;

    @Autowired
    private AppVersionMapper appVersionMapper;

    @Autowired
    private MicroAppMapper microAppMapper;

    @Override
    public AppDependency getById(Long id) {
        return appDependencyMapper.selectById(id);
    }

    @Override
    public List<AppDependency> getByAppId(Long appId) {
        return appDependencyMapper.selectByAppId(appId);
    }

    @Override
    public List<AppDependency> getByAppVersionId(Long appVersionId) {
        return appDependencyMapper.selectByAppVersionId(appVersionId);
    }

    @Override
    public List<AppDependency> getByDependencyCode(String dependencyCode) {
        return appDependencyMapper.selectByDependencyCode(dependencyCode);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean save(AppDependency dependency) {
        dependency.setCreatedAt(LocalDateTime.now());
        return appDependencyMapper.insert(dependency) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean update(AppDependency dependency) {
        return appDependencyMapper.updateById(dependency) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean delete(Long id) {
        return appDependencyMapper.deleteById(id) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteByAppVersionId(Long appVersionId) {
        return appDependencyMapper.deleteByAppVersionId(appVersionId) > 0;
    }

    @Override
    public Map<String, Object> validate(Long appVersionId) {
        Map<String, Object> result = new HashMap<>();
        List<AppDependency> dependencies = appDependencyMapper.selectByAppVersionId(appVersionId);
        List<Map<String, Object>> validationResults = new ArrayList<>();
        boolean allValid = true;

        for (AppDependency dep : dependencies) {
            Map<String, Object> depResult = new HashMap<>();
            depResult.put("dependencyCode", dep.getDependencyCode());
            depResult.put("dependencyName", dep.getDependencyName());
            depResult.put("dependencyType", dep.getDependencyType());
            depResult.put("minVersion", dep.getMinVersion());
            depResult.put("maxVersion", dep.getMaxVersion());
            depResult.put("isRequired", dep.getIsRequired());

            boolean valid = true;
            String message = "兼容";

            if ("APP".equals(dep.getDependencyType())) {
                AppVersion activeVersion = appVersionMapper.selectActiveVersion(
                        getAppIdByCode(dep.getDependencyCode()));
                if (activeVersion == null) {
                    if (dep.getIsRequired() == 1) {
                        valid = false;
                        message = "依赖的应用不存在或未激活";
                    } else {
                        message = "可选依赖未找到，已跳过";
                    }
                } else {
                    depResult.put("actualVersion", activeVersion.getVersion());
                    valid = checkVersionCompatibility(activeVersion.getVersion(),
                            dep.getMinVersion(), dep.getMaxVersion());
                    if (!valid) {
                        message = "版本不兼容，需要 " + formatVersionRange(dep.getMinVersion(), dep.getMaxVersion())
                                + "，实际为 " + activeVersion.getVersion();
                    }
                }
            }

            depResult.put("valid", valid);
            depResult.put("message", message);
            validationResults.add(depResult);

            if (!valid && dep.getIsRequired() == 1) {
                allValid = false;
            }
        }

        result.put("appVersionId", appVersionId);
        result.put("totalDependencies", dependencies.size());
        result.put("valid", allValid);
        result.put("details", validationResults);
        return result;
    }

    @Override
    public Map<String, Object> validateAllDependencies(Long appId) {
        Map<String, Object> result = new HashMap<>();
        List<AppVersion> versions = appVersionMapper.selectByAppId(appId);
        List<Map<String, Object>> versionResults = new ArrayList<>();
        boolean allValid = true;

        for (AppVersion version : versions) {
            Map<String, Object> versionResult = validate(version.getId());
            versionResults.add(versionResult);
            if (!((Boolean) versionResult.get("valid"))) {
                allValid = false;
            }
        }

        result.put("appId", appId);
        result.put("totalVersions", versions.size());
        result.put("valid", allValid);
        result.put("versions", versionResults);
        return result;
    }

    private Long getAppIdByCode(String appCode) {
        return microAppMapper.selectByAppCode(appCode) != null
                ? microAppMapper.selectByAppCode(appCode).getId() : null;
    }

    private boolean checkVersionCompatibility(String actualVersion, String minVersion, String maxVersion) {
        if (actualVersion == null) return false;

        int[] actual = parseVersion(actualVersion);

        if (minVersion != null && !minVersion.isEmpty()) {
            int[] min = parseVersion(minVersion);
            if (compareVersion(actual, min) < 0) {
                return false;
            }
        }

        if (maxVersion != null && !maxVersion.isEmpty()) {
            int[] max = parseVersion(maxVersion);
            if (compareVersion(actual, max) > 0) {
                return false;
            }
        }

        return true;
    }

    private int[] parseVersion(String version) {
        String[] parts = version.replaceAll("[^0-9.]", "").split("\\.");
        int[] result = new int[3];
        for (int i = 0; i < Math.min(parts.length, 3); i++) {
            try {
                result[i] = Integer.parseInt(parts[i]);
            } catch (NumberFormatException e) {
                result[i] = 0;
            }
        }
        return result;
    }

    private int compareVersion(int[] v1, int[] v2) {
        for (int i = 0; i < 3; i++) {
            if (v1[i] != v2[i]) {
                return Integer.compare(v1[i], v2[i]);
            }
        }
        return 0;
    }

    private String formatVersionRange(String min, String max) {
        StringBuilder sb = new StringBuilder();
        if (min != null && !min.isEmpty()) {
            sb.append(">=").append(min);
        }
        if (max != null && !max.isEmpty()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append("<=").append(max);
        }
        return sb.toString();
    }
}
