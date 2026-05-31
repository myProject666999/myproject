package com.micro.frontend.service;

import com.micro.frontend.common.PageResult;
import com.micro.frontend.dto.HealthCheckResultDTO;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.entity.HealthCheck;
import com.micro.frontend.entity.HealthCheckHistory;

import java.util.List;

public interface IHealthCheckService {

    HealthCheck getById(Long id);

    HealthCheck getByAppId(Long appId);

    List<HealthCheck> list();

    List<HealthCheck> getActiveChecks();

    PageResult<HealthCheckHistory> getHistory(PageQueryDTO query);

    List<HealthCheckHistory> getHistoryByAppId(Long appId);

    boolean save(HealthCheck healthCheck);

    boolean update(HealthCheck healthCheck);

    boolean delete(Long id);

    boolean updateStatus(Long id, Integer status);

    HealthCheckResultDTO check(Long id);

    List<HealthCheckResultDTO> checkAll();

    boolean executeHttpCheck(HealthCheck check);

    void saveHistory(HealthCheckHistory history);

    void updateById(HealthCheck check);

    void offlineApp(Long appId);

    int cleanOldHistory(int days);

    void autoOfflineIfNeeded(HealthCheck healthCheck);

    boolean recordHistory(HealthCheckResultDTO result);
}
