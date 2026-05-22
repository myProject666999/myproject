package com.bmi.tracking.common;

public class BusinessException extends RuntimeException {
    private final Integer code;

    public BusinessException(String msg) {
        super(msg);
        this.code = 500;
    }

    public BusinessException(Integer code, String msg) {
        super(msg);
        this.code = code;
    }

    public Integer getCode() {
        return code;
    }
}
