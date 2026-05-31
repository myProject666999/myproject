package com.micro.frontend.service.impl;

import com.micro.frontend.common.PageResult;
import com.micro.frontend.dto.HealthCheckResultDTO;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.entity.HealthCheck;
import com.micro.frontend.entity.HealthCheckHistory;
import com.micro.frontend.mapper.HealthCheckHistoryMapper;
import com.micro.frontend.mapper.HealthCheckMapper;
import com.micro.frontend.mapper.MicroAppMapper;
import com.micro.frontend.service.IHealthCheckService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class HealthCheckServiceImpl implements IHealthCheckService {

    @Autowired
    private HealthCheckMapper healthCheckMapper;

    @Autowired
    private HealthCheckHistoryMapper healthCheckHistoryMapper;

    @Autowired
    private MicroAppMapper microAppMapper;

    @Override
    public HealthCheck getById(Long id) {
        return healthCheckMapper.selectById(id);
    }

    @Override
    public HealthCheck getByAppId(Long appId) {
        return healthCheckMapper.selectByAppId(appId);
    }

    @Override
    public List<HealthCheck> list() {
        com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<HealthCheck> wrapper =
            new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
        return healthCheckMapper.selectList(wrapper);
    }

    @Override
    public List<HealthCheck> getActiveChecks() {
        return healthCheckMapper.selectActiveChecks();
    }

    @Override
    public PageResult<HealthCheckHistory> getHistory(PageQueryDTO query) {
        List<HealthCheckHistory> list = healthCheckHistoryMapper.selectList(query);
        Long total = healthCheckHistoryMapper.selectCount(query);
        return PageResult.of(list, total, query.getPageNum(), query.getPageSize());
    }

    @Override
    public List<HealthCheckHistory> getHistoryByAppId(Long appId) {
        return healthCheckHistoryMapper.selectByAppId(appId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean save(HealthCheck healthCheck) {
        HealthCheck exist = healthCheckMapper.selectByAppId(healthCheck.getAppId());
        if (exist != null) {
            throw new RuntimeException("该应用已有健康检查配置");
        }
        healthCheck.setHealthStatus(2);
        healthCheck.setConsecutiveSuccess(0);
        healthCheck.setConsecutiveFail(0);
        healthCheck.setCreatedAt(LocalDateTime.now());
        healthCheck.setUpdatedAt(LocalDateTime.now());
        return healthCheckMapper.insert(healthCheck) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean update(HealthCheck healthCheck) {
        healthCheck.setUpdatedAt(LocalDateTime.now());
        return healthCheckMapper.updateById(healthCheck) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean delete(Long id) {
        return healthCheckMapper.deleteById(id) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateStatus(Long id, Integer status) {
        return healthCheckMapper.updateStatus(id, status) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public HealthCheckResultDTO check(Long id) {
        HealthCheck healthCheck = healthCheckMapper.selectById(id);
        if (healthCheck == null || healthCheck.getStatus() != 1) {
            throw new RuntimeException("健康检查配置不存在或未启用");
        }
        return doCheck(healthCheck);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<HealthCheckResultDTO> checkAll() {
        List<HealthCheck> activeChecks = healthCheckMapper.selectActiveChecks();
        List<HealthCheckResultDTO> results = new ArrayList<>();
        for (HealthCheck check : activeChecks) {
            try {
                HealthCheckResultDTO result = doCheck(check);
                results.add(result);
            } catch (Exception e) {
                HealthCheckResultDTO result = new HealthCheckResultDTO();
                result.setAppId(check.getAppId());
                result.setAppCode(check.getAppCode());
                result.setCheckResult(0);
                result.setErrorMessage(e.getMessage());
                result.setCheckTime(LocalDateTime.now());
                results.add(result);
            }
        }
        return results;
    }

    private HealthCheckResultDTO doCheck(HealthCheck healthCheck) {
        HealthCheckResultDTO result = new HealthCheckResultDTO();
        result.setAppId(healthCheck.getAppId());
        result.setAppCode(healthCheck.getAppCode());
        result.setCheckUrl(healthCheck.getCheckUrl());
        result.setCheckTime(LocalDateTime.now());

        long startTime = System.currentTimeMillis();
        try {
            URL url = new URL(healthCheck.getCheckUrl());
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(healthCheck.getTimeout() * 1000);
            connection.setReadTimeout(healthCheck.getTimeout() * 1000);
            connection.setRequestMethod("GET");

            int responseCode = connection.getResponseCode();
            long responseTime = System.currentTimeMillis() - startTime;

            result.setResponseTime((int) responseTime);

            if (responseCode >= 200 && responseCode < 300) {
                result.setCheckResult(1);
                processSuccess(healthCheck);
            } else {
                result.setCheckResult(0);
                result.setErrorMessage("HTTP状态码: " + responseCode);
                processFail(healthCheck);
            }
        } catch (Exception e) {
            long responseTime = System.currentTimeMillis() - startTime;
            result.setResponseTime((int) responseTime);
            result.setCheckResult(0);
            result.setErrorMessage(e.getMessage());
            processFail(healthCheck);
        }

        healthCheckMapper.updateLastCheckResult(healthCheck.getId(),
                result.getCheckTime(),
                result.getCheckResult() == 1 ? "SUCCESS" : "FAILED",
                result.getResponseTime());

        result.setHealthStatus(healthCheck.getHealthStatus());
        recordHistory(result);
        autoOfflineIfNeeded(healthCheck);

        return result;
    }

    private void processSuccess(HealthCheck healthCheck) {
        healthCheckMapper.incrementConsecutiveSuccess(healthCheck.getId());
        healthCheckMapper.resetConsecutiveFail(healthCheck.getId());

        HealthCheck current = healthCheckMapper.selectById(healthCheck.getId());
        if (current.getConsecutiveSuccess() + 1 >= healthCheck.getSuccessThreshold()) {
            healthCheckMapper.updateHealthStatus(healthCheck.getId(), 1);
        }
    }

    private void processFail(HealthCheck healthCheck) {
        healthCheckMapper.incrementConsecutiveFail(healthCheck.getId());
        healthCheckMapper.resetConsecutiveSuccess(healthCheck.getId());

        HealthCheck current = healthCheckMapper.selectById(healthCheck.getId());
        if (current.getConsecutiveFail() + 1 >= healthCheck.getFailThreshold()) {
            healthCheckMapper.updateHealthStatus(healthCheck.getId(), 0);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void autoOfflineIfNeeded(HealthCheck healthCheck) {
        if (healthCheck.getAutoOffline() == 1 && healthCheck.getHealthStatus() == 0) {
            HealthCheck current = healthCheckMapper.selectById(healthCheck.getId());
            if (current.getHealthStatus() == 0) {
                microAppMapper.updateStatus(healthCheck.getAppId(), 0);
                healthCheckMapper.updateLastOfflineTime(healthCheck.getId(), LocalDateTime.now());
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean recordHistory(HealthCheckResultDTO result) {
        HealthCheckHistory history = new HealthCheckHistory();
        history.setAppId(result.getAppId());
        history.setAppCode(result.getAppCode());
        history.setCheckTime(result.getCheckTime());
        history.setCheckResult(result.getCheckResult());
        history.setResponseTime(result.getResponseTime());
        history.setErrorMessage(result.getErrorMessage());
        history.setCreatedAt(LocalDateTime.now());
        return healthCheckHistoryMapper.insert(history) > 0;
    }

    @Override
    public boolean executeHttpCheck(HealthCheck check) {
        try {
            URL url = new URL(check.getCheckUrl());
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(check.getTimeout() * 1000);
            connection.setReadTimeout(check.getTimeout() * 1000);
            connection.setRequestMethod("GET");
            int responseCode = connection.getResponseCode();
            return responseCode >= 200 && responseCode < 300;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveHistory(HealthCheckHistory history) {
        healthCheckHistoryMapper.insert(history);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateById(HealthCheck check) {
        check.setUpdatedAt(LocalDateTime.now());
        healthCheckMapper.updateById(check);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void offlineApp(Long appId) {
        microAppMapper.updateStatus(appId, 0);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int cleanOldHistory(int days) {
        return healthCheckHistoryMapper.cleanOldHistory(days);
    }
}
