package com.creator.platform.enums;

import lombok.Getter;

@Getter
public enum PlatformCodeEnum {

    DOUYIN("DOUYIN", "抖音"),
    BILIBILI("BILIBILI", "B站"),
    XIAOHONGSHU("XIAOHONGSHU", "小红书");

    private final String code;
    private final String name;

    PlatformCodeEnum(String code, String name) {
        this.code = code;
        this.name = name;
    }

    public static PlatformCodeEnum getByCode(String code) {
        for (PlatformCodeEnum value : values()) {
            if (value.getCode().equals(code)) {
                return value;
            }
        }
        return null;
    }
}
