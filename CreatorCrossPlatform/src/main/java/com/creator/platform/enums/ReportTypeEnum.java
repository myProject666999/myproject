package com.creator.platform.enums;

import lombok.Getter;

@Getter
public enum ReportTypeEnum {

    ALL("ALL", "全平台"),
    DOUYIN("DOUYIN", "抖音"),
    BILIBILI("BILIBILI", "B站"),
    XIAOHONGSHU("XIAOHONGSHU", "小红书");

    private final String code;
    private final String name;

    ReportTypeEnum(String code, String name) {
        this.code = code;
        this.name = name;
    }
}
