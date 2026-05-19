package com.cloudbackup.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("version_snapshot")
public class VersionSnapshot {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long addressBookId;

    private Integer version;

    private String snapshotData;

    private Integer contactCount;

    private String changeType;

    private String description;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdTime;

    @TableLogic
    private Integer deleted;
}
