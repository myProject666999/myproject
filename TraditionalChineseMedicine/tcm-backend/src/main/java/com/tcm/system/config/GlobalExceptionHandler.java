package com.tcm.system.config;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e) {
        log.error("系统异常：", e);
        String msg = e.getMessage() != null ? e.getMessage() : "服务器内部错误";
        if (e.getCause() != null && e.getCause().getMessage() != null) {
            msg = e.getCause().getMessage();
        }
        return Result.error(500, msg);
    }
}
