package com.mortgage.enums;

import lombok.Getter;

@Getter
public enum RepaymentType {
    EQUAL_INSTALLMENT("等额本息"),
    EQUAL_PRINCIPAL("等额本金");

    private final String desc;

    RepaymentType(String desc) {
        this.desc = desc;
    }
}
