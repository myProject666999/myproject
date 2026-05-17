package com.mortgage.enums;

import lombok.Getter;

@Getter
public enum PrepaymentType {
    SHORTEN_TERM("减期"),
    REDUCE_PAYMENT("减额");

    private final String desc;

    PrepaymentType(String desc) {
        this.desc = desc;
    }
}
