package com.recruitment.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum JobStatusEnum {

    OPEN("招聘中"),
    PAUSED("已暂停"),
    CLOSED("已关闭");

    private final String description;
}
