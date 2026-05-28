package com.community.gridgovernance.enums;

import lombok.Getter;

@Getter
public enum OperationTypeEnum {
    CREATE("CREATE", "创建工单"),
    ASSIGN("ASSIGN", "派单"),
    ACCEPT("ACCEPT", "接单"),
    PROCESS("PROCESS", "处理"),
    ESCALATE("ESCALATE", "升级"),
    COMPLETE("COMPLETE", "完成"),
    EVALUATE("EVALUATE", "评价"),
    CLOSE("CLOSE", "关闭");

    private final String code;
    private final String desc;

    OperationTypeEnum(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
