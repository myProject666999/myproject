package com.corporate.reimbursement.common;

public enum ReimbursementStatus {
    DRAFT(0, "草稿"),
    PENDING(1, "审批中"),
    APPROVED(2, "已通过"),
    REJECTED(3, "已驳回"),
    PAID(4, "已支付");

    private final Integer code;
    private final String description;

    ReimbursementStatus(Integer code, String description) {
        this.code = code;
        this.description = description;
    }

    public Integer getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static ReimbursementStatus fromCode(Integer code) {
        for (ReimbursementStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }
}