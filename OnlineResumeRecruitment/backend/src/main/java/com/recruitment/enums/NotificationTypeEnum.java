package com.recruitment.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum NotificationTypeEnum {

    SYSTEM("系统通知"),
    APPLICATION("投递通知"),
    INTERVIEW("面试通知"),
    MESSAGE("聊天消息");

    private final String description;
}
