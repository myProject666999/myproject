package com.port.container.aspect;

import cn.hutool.core.util.ArrayUtil;
import cn.hutool.json.JSONUtil;
import com.port.container.service.OperationLogService;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.DefaultParameterNameDiscoverer;
import org.springframework.core.ParameterNameDiscoverer;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Aspect
@Component
public class OperationLogAspect {

    @Autowired
    private OperationLogService operationLogService;

    private final ParameterNameDiscoverer parameterNameDiscoverer = new DefaultParameterNameDiscoverer();

    @Around("@annotation(operationLog)")
    public Object around(ProceedingJoinPoint point, OperationLog operationLog) throws Throwable {
        long startTime = System.currentTimeMillis();
        Object result = null;
        Exception exception = null;

        try {
            result = point.proceed();
            return result;
        } catch (Exception e) {
            exception = e;
            throw e;
        } finally {
            try {
                saveLog(point, operationLog, result, exception, System.currentTimeMillis() - startTime);
            } catch (Exception e) {
                log.error("操作日志记录失败", e);
            }
        }
    }

    private void saveLog(ProceedingJoinPoint point, OperationLog operationLog, Object result, Exception exception, long costTime) {
        MethodSignature signature = (MethodSignature) point.getSignature();
        Method method = signature.getMethod();

        String module = operationLog.module();
        String operationType = operationLog.operationType();
        String description = operationLog.description();

        Object[] args = point.getArgs();
        String[] parameterNames = parameterNameDiscoverer.getParameterNames(method);

        Map<String, Object> params = new HashMap<>();
        if (ArrayUtil.isNotEmpty(args) && ArrayUtil.isNotEmpty(parameterNames)) {
            for (int i = 0; i < args.length; i++) {
                if (args[i] != null && !isIgnoreType(args[i].getClass())) {
                    params.put(parameterNames[i], args[i]);
                }
            }
        }

        Long operatorId = 1L;
        String operatorName = "系统管理员";

        String ip = getClientIp();
        String userAgent = getUserAgent();

        Long businessId = extractBusinessId(args);
        String businessNo = extractBusinessNo(args);

        String beforeContent = null;
        String afterContent = null;

        if (!params.isEmpty()) {
            afterContent = JSONUtil.toJsonStr(params);
        }

        if (result != null) {
            afterContent = JSONUtil.toJsonStr(result);
        }

        String remark = description;
        if (exception != null) {
            remark = "执行失败: " + exception.getMessage();
        }

        operationLogService.logOperation(
                module, operationType, businessId, businessNo,
                beforeContent, afterContent, operatorId, operatorName, ip
        );
    }

    private boolean isIgnoreType(Class<?> clazz) {
        return HttpServletRequest.class.isAssignableFrom(clazz) ||
               javax.servlet.http.HttpServletResponse.class.isAssignableFrom(clazz) ||
               org.springframework.web.multipart.MultipartFile.class.isAssignableFrom(clazz);
    }

    private Long extractBusinessId(Object[] args) {
        for (Object arg : args) {
            if (arg == null) continue;
            try {
                Method getIdMethod = arg.getClass().getMethod("getId");
                if (getIdMethod != null) {
                    Object id = getIdMethod.invoke(arg);
                    if (id instanceof Long) {
                        return (Long) id;
                    }
                }
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    private String extractBusinessNo(Object[] args) {
        for (Object arg : args) {
            if (arg == null) continue;
            try {
                Method[] methods = arg.getClass().getMethods();
                for (Method method : methods) {
                    if (method.getName().startsWith("get") &&
                        (method.getName().contains("No") || method.getName().contains("Code")) &&
                        method.getReturnType() == String.class) {
                        Object value = method.invoke(arg);
                        if (value != null) {
                            return (String) value;
                        }
                    }
                }
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    private String getClientIp() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String ip = request.getHeader("X-Forwarded-For");
            if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getHeader("X-Real-IP");
            }
            if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getRemoteAddr();
            }
            return ip;
        }
        return "127.0.0.1";
    }

    private String getUserAgent() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            return request.getHeader("User-Agent");
        }
        return null;
    }
}
