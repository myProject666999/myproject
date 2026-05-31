package com.port.container.exception;

import com.port.container.common.R;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public R<Void> handleBusinessException(BusinessException e) {
        log.error("业务异常：{}", e.getMessage(), e);
        return R.fail(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public R<Void> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        log.warn("参数校验异常：{}", message);
        return R.fail(400, message);
    }

    @ExceptionHandler(BindException.class)
    public R<Void> handleBindException(BindException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        log.warn("参数绑定异常：{}", message);
        return R.fail(400, message);
    }

    @ExceptionHandler(OptimisticLockException.class)
    public R<Void> handleOptimisticLockException(OptimisticLockException e) {
        log.error("乐观锁异常：{}", e.getMessage(), e);
        return R.fail(409, "数据已被其他用户修改，请刷新后重试");
    }

    @ExceptionHandler(TaskConflictException.class)
    public R<Void> handleTaskConflictException(TaskConflictException e) {
        log.error("任务调度冲突：{}", e.getMessage(), e);
        return R.fail(409, e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public R<Void> handleException(Exception e) {
        log.error("系统异常：{}", e.getMessage(), e);
        return R.fail(500, "系统繁忙，请稍后重试");
    }
}
