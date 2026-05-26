package com.recruitment.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum RoleEnum {

    JOB_SEEKER("求职者"),
    HR("企业HR");

    private final String description;
}
