package com.dental.clinic.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("reminder")
public class Reminder {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long patientId;
    private Long appointmentId;
    private Long treatmentPlanId;
    private String reminderType;
    private String title;
    private String content;
    private LocalDateTime reminderTime;
    private LocalDateTime sentTime;
    private String sendMethod;
    private Integer sendStatus;
    private Integer readStatus;
    private LocalDateTime createTime;
}
