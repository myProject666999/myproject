package com.micro.frontend.aop;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.micro.frontend.annotation.Audit;
import com.micro.frontend.service.IAuditLogService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

@Aspect
@Component
public class AuditAspect {

    private static final Logger logger = LoggerFactory.getLogger(AuditAspect.class);

    @Autowired
    private IAuditLogService auditLogService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Around("@annotation(audit)")
    public Object around(ProceedingJoinPoint joinPoint, Audit audit) throws Throwable {
        long startTime = System.currentTimeMillis();
        Object result = null;
        Exception exception = null;

        try {
            result = joinPoint.proceed();
            return result;
        } catch (Exception e) {
            exception = e;
            throw e;
        } finally {
            try {
                recordAuditLog(joinPoint, audit, result, exception, System.currentTimeMillis() - startTime);
            } catch (Exception e) {
                logger.error("记录审计日志失败", e);
            }
        }
    }

    private void recordAuditLog(ProceedingJoinPoint joinPoint, Audit audit, Object result, Exception exception, long costTime) {
        String operationType = audit.operationType();
        String module = audit.module();
        String targetTable = audit.targetTable();
        String description = audit.description();

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        Object[] args = joinPoint.getArgs();
        String[] paramNames = signature.getParameterNames();

        String oldValue = null;
        String newValue = null;
        Long targetId = null;
        String targetKey = null;

        try {
            Map<String, Object> params = new HashMap<>();
            for (int i = 0; i < args.length; i++) {
                if (args[i] != null && isPrimitiveOrWrapper(args[i].getClass())) {
                    params.put(paramNames[i], args[i]);
                    if ("id".equals(paramNames[i]) && args[i] instanceof Long) {
                        targetId = (Long) args[i];
                    }
                } else if (args[i] != null) {
                    newValue = objectMapper.writeValueAsString(args[i]);
                    if (args[i] instanceof Map) {
                        Map<?, ?> map = (Map<?, ?>) args[i];
                        if (map.get("id") instanceof Long) {
                            targetId = (Long) map.get("id");
                        }
                    } else {
                        try {
                            Method getIdMethod = args[i].getClass().getMethod("getId");
                            Object idValue = getIdMethod.invoke(args[i]);
                            if (idValue instanceof Long) {
                                targetId = (Long) idValue;
                            }
                        } catch (NoSuchMethodException ignored) {
                        }
                    }
                }
            }
            if (!params.isEmpty()) {
                oldValue = objectMapper.writeValueAsString(params);
            }
        } catch (JsonProcessingException e) {
            logger.warn("序列化参数失败", e);
        } catch (Exception e) {
            logger.warn("获取参数ID失败", e);
        }

        String operator = getCurrentUser();
        String operatorIp = getClientIp();

        String changeSummary = description;
        if (exception != null) {
            changeSummary += " - 失败: " + exception.getMessage();
        } else {
            changeSummary += " - 成功, 耗时: " + costTime + "ms";
        }

        try {
            auditLogService.record(
                    operationType,
                    module,
                    targetTable,
                    targetId,
                    targetKey,
                    operator,
                    operatorIp,
                    oldValue,
                    newValue,
                    changeSummary
            );
        } catch (Exception e) {
            logger.error("保存审计日志失败", e);
        }
    }

    private String getCurrentUser() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String user = request.getHeader("X-User-Name");
                if (user != null && !user.isEmpty()) {
                    return user;
                }
                user = request.getHeader("X-User-Id");
                if (user != null && !user.isEmpty()) {
                    return user;
                }
            }
        } catch (Exception e) {
            logger.warn("获取当前用户失败", e);
        }
        return "system";
    }

    private String getClientIp() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String ip = request.getHeader("X-Forwarded-For");
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getHeader("Proxy-Client-IP");
                }
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getHeader("WL-Proxy-Client-IP");
                }
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getHeader("HTTP_CLIENT_IP");
                }
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getHeader("HTTP_X_FORWARDED_FOR");
                }
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getRemoteAddr();
                }
                if (ip != null && ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                return ip;
            }
        } catch (Exception e) {
            logger.warn("获取客户端IP失败", e);
        }
        return "127.0.0.1";
    }

    private boolean isPrimitiveOrWrapper(Class<?> clazz) {
        return clazz.isPrimitive()
                || clazz == Integer.class
                || clazz == Long.class
                || clazz == Short.class
                || clazz == Byte.class
                || clazz == Float.class
                || clazz == Double.class
                || clazz == Boolean.class
                || clazz == Character.class
                || clazz == String.class;
    }
}
