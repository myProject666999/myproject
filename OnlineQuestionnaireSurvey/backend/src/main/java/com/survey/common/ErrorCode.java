package com.survey.common;

import lombok.Getter;

@Getter
public enum ErrorCode {

    SUCCESS(200, "success"),
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),
    INTERNAL_ERROR(500, "服务器内部错误"),

    USER_NOT_FOUND(1001, "用户不存在"),
    USER_ALREADY_EXISTS(1002, "用户名已存在"),
    PASSWORD_ERROR(1003, "密码错误"),
    USER_DISABLED(1004, "账号已被禁用"),

    SURVEY_NOT_FOUND(2001, "问卷不存在"),
    SURVEY_NOT_PUBLISHED(2002, "问卷未发布"),
    SURVEY_EXPIRED(2003, "问卷已过期"),
    SURVEY_FULL(2004, "问卷填写数已满"),
    SURVEY_ALREADY_SUBMITTED(2005, "您已提交过问卷"),

    RATE_LIMIT_IP(3001, "IP提交过于频繁，请稍后再试"),
    RATE_LIMIT_DEVICE(3002, "设备提交过于频繁，请稍后再试"),

    ANSWER_REQUIRED(4001, "必填项不能为空"),
    ANSWER_VALIDATION_ERROR(4002, "答案格式错误");

    private final Integer code;
    private final String message;

    ErrorCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}
