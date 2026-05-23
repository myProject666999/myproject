package com.oj.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ResultCode {
    SUCCESS(200, "操作成功"),
    ERROR(500, "服务器内部错误"),
    PARAM_ERROR(400, "参数错误"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),
    USERNAME_OR_PASSWORD_ERROR(1001, "用户名或密码错误"),
    USER_ALREADY_EXISTS(1002, "用户名已存在"),
    USER_NOT_FOUND(1003, "用户不存在"),
    PROBLEM_NOT_FOUND(2001, "题目不存在"),
    SUBMISSION_NOT_FOUND(3001, "提交记录不存在"),
    CONTEST_NOT_FOUND(4001, "竞赛不存在"),
    CONTEST_NOT_STARTED(4002, "竞赛未开始"),
    CONTEST_ENDED(4003, "竞赛已结束"),
    JUDGE_ERROR(5001, "判题出错"),
    CODE_TOO_LONG(5002, "代码长度超出限制"),
    LANGUAGE_NOT_SUPPORTED(5003, "不支持的编程语言");

    private final Integer code;
    private final String message;
}
