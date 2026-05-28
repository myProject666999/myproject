package com.community.gridgovernance.enums;

import lombok.Getter;

@Getter
public enum OrderStatusEnum {
    PENDING("PENDING", "待派单"),
    ASSIGNED("ASSIGNED", "已派单"),
    PROCESSING("PROCESSING", "处理中"),
    ESCALATED("ESCALATED", "已升级"),
    COMPLETED("COMPLETED", "已完成"),
    EVALUATED("EVALUATED", "已评价"),
    CLOSED("CLOSED", "已关闭");

    private final String code;
    private final String desc;

    OrderStatusEnum(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
