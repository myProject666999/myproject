package com.db.schema.review.service;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.db.schema.review.entity.AuditLog;
import com.db.schema.review.mapper.AuditLogMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;

@Slf4j
@Service
public class AuditLogService {

    @Autowired
    private AuditLogMapper auditLogMapper;

    public void log(String module, String operation, Long targetId, String targetType,
                    String targetTitle, String beforeData, String afterData, String changeDetail) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setLogNo(IdUtil.simpleUUID());
            auditLog.setModule(module);
            auditLog.setOperation(operation);
            auditLog.setTargetId(targetId);
            auditLog.setTargetType(targetType);
            auditLog.setTargetTitle(targetTitle);
            auditLog.setBeforeData(beforeData);
            auditLog.setAfterData(afterData);
            auditLog.setChangeDetail(changeDetail);
            auditLog.setOperationTime(LocalDateTime.now());

            auditLog.setUserId(1L);
            auditLog.setUserName("system");

            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                auditLog.setIpAddress(getClientIp(request));
                auditLog.setUserAgent(request.getHeader("User-Agent"));
            }

            auditLogMapper.insert(auditLog);
        } catch (Exception e) {
            log.error("记录审计日志失败", e);
        }
    }

    public void logOrderOperation(String operation, Long orderId, String orderTitle,
                                  String beforeData, String afterData, String changeDetail) {
        log("order", operation, orderId, "schema_order", orderTitle, beforeData, afterData, changeDetail);
    }

    public void logReviewOperation(String operation, Long orderId, String orderTitle,
                                   String beforeData, String afterData, String changeDetail) {
        log("review", operation, orderId, "schema_order", orderTitle, beforeData, afterData, changeDetail);
    }

    public void logExecutionOperation(String operation, Long executionId, String orderTitle,
                                      String beforeData, String afterData, String changeDetail) {
        log("execution", operation, executionId, "execution_record", orderTitle, beforeData, afterData, changeDetail);
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    public Page<AuditLog> getAuditLogPage(int pageNum, int pageSize, String module, String operation, Long userId) {
        LambdaQueryWrapper<AuditLog> wrapper = new LambdaQueryWrapper<>();
        if (module != null && !module.isEmpty()) {
            wrapper.eq(AuditLog::getModule, module);
        }
        if (operation != null && !operation.isEmpty()) {
            wrapper.eq(AuditLog::getOperation, operation);
        }
        if (userId != null) {
            wrapper.eq(AuditLog::getUserId, userId);
        }
        wrapper.orderByDesc(AuditLog::getOperationTime);
        return auditLogMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }
}
