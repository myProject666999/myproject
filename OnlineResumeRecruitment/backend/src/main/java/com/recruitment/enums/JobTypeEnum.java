package com.recruitment.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum JobTypeEnum {

    FULL_TIME("全职"),
    PART_TIME("兼职"),
    INTERN("实习");

    private final String description;
}
