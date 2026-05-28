package com.creator.platform.enums;

import lombok.Getter;

@Getter
public enum SyncStatusEnum {

    PENDING(0, "待执行"),
    EXECUTING(1, "执行中"),
    SUCCESS(2, "成功"),
    FAILED(3, "失败");

    private final Integer code;
    private final String name;

    SyncStatusEnum(Integer code, String name) {
        this.code = code;
        this.name = name;
    }
}
