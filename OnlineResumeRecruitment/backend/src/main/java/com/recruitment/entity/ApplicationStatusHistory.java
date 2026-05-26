package com.recruitment.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.IdType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("application_status_history")
public class ApplicationStatusHistory {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long applicationId;

    private Long operatorId;

    private String operatorRole;

    private String fromStatus;

    private String toStatus;

    private String remark;

    private LocalDateTime createdAt;
}
