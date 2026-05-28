package com.community.gridgovernance.enums;

import lombok.Getter;

@Getter
public enum OrderTypeEnum {
    TRASH("TRASH", "垃圾问题"),
    ILLEGAL_BUILD("ILLEGAL_BUILD", "违建问题"),
    FACILITY_DAMAGE("FACILITY_DAMAGE", "设施损坏"),
    OTHER("OTHER", "其他问题");

    private final String code;
    private final String desc;

    OrderTypeEnum(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
