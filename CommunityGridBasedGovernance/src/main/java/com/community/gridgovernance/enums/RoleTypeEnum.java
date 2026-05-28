package com.community.gridgovernance.enums;

import lombok.Getter;

@Getter
public enum RoleTypeEnum {
    ADMIN("ADMIN", "管理员"),
    RESIDENT("RESIDENT", "居民"),
    GRID_WORKER("GRID_WORKER", "网格员");

    private final String code;
    private final String desc;

    RoleTypeEnum(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
