package com.recruitment.common;

import lombok.Data;

import java.io.Serializable;

@Data
public class Result<T> implements Serializable {

    private Integer code;
    private String message;
    private T data;
    private Boolean success;

    public static <T> Result<T> ok() {
        return build(ResultCode.SUCCESS.getCode(), ResultCode.SUCCESS.getMessage(), null, true);
    }

    public static <T> Result<T> ok(T data) {
        return build(ResultCode.SUCCESS.getCode(), ResultCode.SUCCESS.getMessage(), data, true);
    }

    public static <T> Result<T> ok(String message, T data) {
        return build(ResultCode.SUCCESS.getCode(), message, data, true);
    }

    public static <T> Result<T> error() {
        return build(ResultCode.ERROR.getCode(), ResultCode.ERROR.getMessage(), null, false);
    }

    public static <T> Result<T> error(String message) {
        return build(ResultCode.ERROR.getCode(), message, null, false);
    }

    public static <T> Result<T> error(Integer code, String message) {
        return build(code, message, null, false);
    }

    public static <T> Result<T> fail() {
        return build(ResultCode.BAD_REQUEST.getCode(), ResultCode.BAD_REQUEST.getMessage(), null, false);
    }

    public static <T> Result<T> fail(String message) {
        return build(ResultCode.BAD_REQUEST.getCode(), message, null, false);
    }

    public static <T> Result<T> fail(ResultCode resultCode) {
        return build(resultCode.getCode(), resultCode.getMessage(), null, false);
    }

    private static <T> Result<T> build(Integer code, String message, T data, Boolean success) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        result.setData(data);
        result.setSuccess(success);
        return result;
    }
}
