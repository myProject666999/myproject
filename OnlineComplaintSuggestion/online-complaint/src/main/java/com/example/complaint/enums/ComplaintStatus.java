package com.example.complaint.enums;

public enum ComplaintStatus {
    PENDING("待受理"),
    PROCESSING("处理中"),
    REPLIED("已回复"),
    COMPLETED("已完成");

    private final String label;

    ComplaintStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
