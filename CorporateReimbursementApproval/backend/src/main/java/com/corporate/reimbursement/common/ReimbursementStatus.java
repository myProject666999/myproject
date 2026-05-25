package com.corporate.reimbursement.common;

public enum ReimbursementStatus {
    DRAFT("DRAFT", "草稿"),
    PENDING("PENDING", "审批中"),
    APPROVED("APPROVED", "已通过"),
    REJECTED("REJECTED", "已驳回"),
    PAID("PAID", "已支付");

    private final String code;
    private final String description;

    ReimbursementStatus(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static ReimbursementStatus fromCode(String code) {
        for (ReimbursementStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        return null;
    }
}