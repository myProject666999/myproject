package com.training.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ResultCode {

    SUCCESS(200, "操作成功"),
    FAIL(500, "操作失败"),
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),

    LOGIN_FAILED(1001, "用户名或密码错误"),
    USER_DISABLED(1002, "账号已禁用"),
    TOKEN_EXPIRED(1003, "登录已过期"),

    TRAINING_NOT_FOUND(2001, "培训班不存在"),
    TRAINING_ALREADY_FINISHED(2002, "培训班已结束"),
    TRAINING_ALREADY_STARTED(2003, "培训班已开始"),

    STUDENT_NOT_FOUND(3001, "学员不存在"),
    STUDENT_ALREADY_ENROLLED(3002, "学员已报名"),
    STUDENT_NOT_ENROLLED(3003, "学员未报名"),

    ATTENDANCE_CHECKED(4001, "已签到，请勿重复签到"),
    ATTENDANCE_SESSION_EXPIRED(4002, "签到会话已过期"),
    ATTENDANCE_INVALID_QR(4003, "无效的签到二维码"),

    CERTIFICATE_ALREADY_EXISTS(5001, "证书已存在"),
    CERTIFICATE_NOT_FOUND(5002, "证书不存在"),
    CERTIFICATE_NOT_ELIGIBLE(5003, "未达到颁发证书要求"),
    CERTIFICATE_REVOKED(5004, "证书已吊销");

    private final Integer code;
    private final String message;
}
