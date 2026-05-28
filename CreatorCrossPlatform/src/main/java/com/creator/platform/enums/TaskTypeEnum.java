package com.creator.platform.enums;

import lombok.Getter;

@Getter
public enum TaskTypeEnum {

    ACCOUNT_DATA("ACCOUNT_DATA", "账号数据同步"),
    CONTENT_DATA("CONTENT_DATA", "内容数据同步"),
    DAILY_AGGREGATION("DAILY_AGGREGATION", "日数据聚合"),
    WEEKLY_REPORT("WEEKLY_REPORT", "周报生成");

    private final String code;
    private final String name;

    TaskTypeEnum(String code, String name) {
        this.code = code;
        this.name = name;
    }
}
