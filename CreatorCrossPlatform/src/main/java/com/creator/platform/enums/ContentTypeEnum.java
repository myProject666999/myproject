package com.creator.platform.enums;

import lombok.Getter;

@Getter
public enum ContentTypeEnum {

    VIDEO("VIDEO", "视频"),
    ARTICLE("ARTICLE", "文章"),
    IMAGE("IMAGE", "图文");

    private final String code;
    private final String name;

    ContentTypeEnum(String code, String name) {
        this.code = code;
        this.name = name;
    }
}
