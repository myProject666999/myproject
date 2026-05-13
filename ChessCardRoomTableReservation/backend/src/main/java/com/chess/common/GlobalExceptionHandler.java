package com.chess.common;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(Exception.class)
    public Result<?> handleException(Exception e) {
        logger.error("系统异常", e);
        String message = e.getMessage() != null ? e.getMessage() : "系统内部错误";
        return Result.error(message);
    }

    @ExceptionHandler(RuntimeException.class)
    public Result<?> handleRuntimeException(RuntimeException e) {
        logger.error("运行时异常", e);
        String message = e.getMessage() != null ? e.getMessage() : "系统内部错误";
        return Result.error(message);
    }
}
