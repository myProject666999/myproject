package com.birthdayreminder.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("reminder_setting")
public class ReminderSetting {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long contactId;
    private Integer remindDays;
    private Integer remindType;
    private Integer isEnabled;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
