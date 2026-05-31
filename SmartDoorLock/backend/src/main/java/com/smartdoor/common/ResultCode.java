package com.smartdoor.common;

public enum ResultCode {
    SUCCESS(200, "操作成功"),
    ERROR(500, "操作失败"),
    PARAM_ERROR(400, "参数错误"),
    UNAUTHORIZED(401, "未登录或登录已过期"),
    FORBIDDEN(403, "权限不足"),
    NOT_FOUND(404, "资源不存在"),
    DUPLICATE_KEY(409, "数据已存在"),
    BUSINESS_ERROR(600, "业务处理失败"),
    PASSWORD_ERROR(601, "密码错误"),
    ACCOUNT_DISABLED(602, "账号已被禁用"),
    LOCK_OFFLINE(603, "门锁离线"),
    PASSWORD_EXPIRED(604, "密码已过期"),
    BILL_OVERDUE(605, "账单已逾期"),
    CONTRACT_EXPIRED(606, "租约已到期");

    private final Integer code;
    private final String message;

    ResultCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }

    public Integer getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
