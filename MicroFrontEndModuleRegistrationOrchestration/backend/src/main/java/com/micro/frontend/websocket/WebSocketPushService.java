package com.micro.frontend.websocket;

import com.micro.frontend.common.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class WebSocketPushService {

    private static final Logger log = LoggerFactory.getLogger(WebSocketPushService.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void pushConfigChange(Long publishId, String appCode) {
        Map<String, Object> data = new HashMap<>();
        data.put("type", "CONFIG_CHANGE");
        data.put("publishId", publishId);
        data.put("appCode", appCode);
        data.put("timestamp", System.currentTimeMillis());

        try {
            messagingTemplate.convertAndSend(Constants.WEBSOCKET_TOPIC_CONFIG, data);
            log.info("配置变更推送成功, publishId: {}, appCode: {}", publishId, appCode);
        } catch (Exception e) {
            log.error("配置变更推送失败: {}", e.getMessage(), e);
        }
    }

    public void pushAppStatusChange(Long appId, String appCode, Integer status) {
        Map<String, Object> data = new HashMap<>();
        data.put("type", "APP_STATUS_CHANGE");
        data.put("appId", appId);
        data.put("appCode", appCode);
        data.put("status", status);
        data.put("timestamp", System.currentTimeMillis());

        try {
            messagingTemplate.convertAndSend(Constants.WEBSOCKET_TOPIC_APP, data);
            log.info("应用状态变更推送成功, appCode: {}, status: {}", appCode, status);
        } catch (Exception e) {
            log.error("应用状态变更推送失败: {}", e.getMessage(), e);
        }
    }

    public void pushHealthCheckResult(Long appId, String appCode, Integer healthStatus, Integer responseTime) {
        Map<String, Object> data = new HashMap<>();
        data.put("type", "HEALTH_CHECK_RESULT");
        data.put("appId", appId);
        data.put("appCode", appCode);
        data.put("healthStatus", healthStatus);
        data.put("responseTime", responseTime);
        data.put("timestamp", System.currentTimeMillis());

        try {
            messagingTemplate.convertAndSend(Constants.WEBSOCKET_TOPIC_HEALTH, data);
            log.info("健康检查结果推送成功, appCode: {}, healthStatus: {}", appCode, healthStatus);
        } catch (Exception e) {
            log.error("健康检查结果推送失败: {}", e.getMessage(), e);
        }
    }

    public void pushToUser(String userId, String destination, Object payload) {
        try {
            messagingTemplate.convertAndSendToUser(userId, destination, payload);
            log.info("定向推送成功, userId: {}, destination: {}", userId, destination);
        } catch (Exception e) {
            log.error("定向推送失败: {}", e.getMessage(), e);
        }
    }
}
