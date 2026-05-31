package com.micro.frontend.task;

import com.micro.frontend.common.Constants;
import com.micro.frontend.entity.HealthCheck;
import com.micro.frontend.entity.HealthCheckHistory;
import com.micro.frontend.service.IHealthCheckService;
import com.micro.frontend.websocket.WebSocketPushService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class HealthCheckTask {

    private static final Logger log = LoggerFactory.getLogger(HealthCheckTask.class);

    @Autowired
    private IHealthCheckService healthCheckService;

    @Autowired
    private WebSocketPushService webSocketPushService;

    @Scheduled(fixedDelay = 10000, initialDelay = 30000)
    public void executeHealthCheck() {
        log.info("开始执行健康检查定时任务...");
        try {
            List<HealthCheck> checks = healthCheckService.getActiveChecks();
            log.info("待检查应用数量: {}", checks.size());

            for (HealthCheck check : checks) {
                try {
                    performCheck(check);
                } catch (Exception e) {
                    log.error("检查应用 {} 健康状态失败: {}", check.getAppCode(), e.getMessage(), e);
                }
            }
        } catch (Exception e) {
            log.error("健康检查定时任务执行异常: {}", e.getMessage(), e);
        }
    }

    private void performCheck(HealthCheck check) {
        long startTime = System.currentTimeMillis();
        boolean success = false;
        String errorMessage = null;
        int responseTime = 0;

        try {
            success = healthCheckService.executeHttpCheck(check);
            responseTime = (int) (System.currentTimeMillis() - startTime);
        } catch (Exception e) {
            errorMessage = e.getMessage();
            responseTime = (int) (System.currentTimeMillis() - startTime);
            success = false;
        }

        HealthCheckHistory history = new HealthCheckHistory();
        history.setAppId(check.getAppId());
        history.setAppCode(check.getAppCode());
        history.setCheckTime(LocalDateTime.now());
        history.setCheckResult(success ? 1 : 0);
        history.setResponseTime(responseTime);
        history.setErrorMessage(errorMessage);
        history.setCreatedAt(LocalDateTime.now());
        healthCheckService.saveHistory(history);

        updateHealthStatus(check, success, responseTime, errorMessage);
    }

    private void updateHealthStatus(HealthCheck check, boolean success, int responseTime, String errorMessage) {
        Integer previousStatus = check.getHealthStatus();
        int newConsecutiveSuccess = success ? check.getConsecutiveSuccess() + 1 : 0;
        int newConsecutiveFail = success ? 0 : check.getConsecutiveFail() + 1;

        Integer newHealthStatus = previousStatus;
        if (newConsecutiveSuccess >= check.getSuccessThreshold()) {
            newHealthStatus = Constants.HEALTH_STATUS_NORMAL;
        } else if (newConsecutiveFail >= check.getFailThreshold()) {
            newHealthStatus = Constants.HEALTH_STATUS_ABNORMAL;
        }

        check.setHealthStatus(newHealthStatus);
        check.setConsecutiveSuccess(newConsecutiveSuccess);
        check.setConsecutiveFail(newConsecutiveFail);
        check.setLastCheckTime(LocalDateTime.now());
        check.setLastCheckResult(success ? "SUCCESS" : "FAILED: " + (errorMessage != null ? errorMessage : "Unknown"));
        check.setLastResponseTime(responseTime);

        healthCheckService.updateById(check);

        if (!previousStatus.equals(newHealthStatus)) {
            log.warn("应用 {} 健康状态变更: {} -> {}", check.getAppCode(), previousStatus, newHealthStatus);

            if (newHealthStatus == Constants.HEALTH_STATUS_ABNORMAL && check.getAutoOffline() == 1) {
                log.info("应用 {} 健康状态异常，执行自动下线", check.getAppCode());
                healthCheckService.offlineApp(check.getAppId());
                check.setLastOfflineTime(LocalDateTime.now());
                healthCheckService.updateById(check);
            }

            webSocketPushService.pushHealthCheckResult(
                    check.getAppId(),
                    check.getAppCode(),
                    newHealthStatus,
                    responseTime
            );
        }
    }

    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanOldHistory() {
        log.info("开始清理30天前的健康检查历史数据...");
        try {
            int deleted = healthCheckService.cleanOldHistory(30);
            log.info("清理健康检查历史数据完成，删除记录数: {}", deleted);
        } catch (Exception e) {
            log.error("清理健康检查历史数据失败: {}", e.getMessage(), e);
        }
    }
}
