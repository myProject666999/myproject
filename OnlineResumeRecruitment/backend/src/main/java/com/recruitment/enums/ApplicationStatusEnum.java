package com.recruitment.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ApplicationStatusEnum {

    PENDING("待查看"),
    VIEWED("已查看"),
    PASSED("初筛通过"),
    INTERVIEW("面试中"),
    OFFER("已发Offer"),
    REJECTED("已拒绝"),
    HIRED("已录用");

    private final String description;
}
