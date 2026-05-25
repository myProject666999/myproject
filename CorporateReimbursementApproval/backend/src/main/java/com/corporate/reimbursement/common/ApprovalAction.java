package com.corporate.reimbursement.common;

public enum ApprovalAction {
    APPROVED("通过"),
    REJECTED("驳回"),
    TRANSFER("转办");

    private final String description;

    ApprovalAction(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}