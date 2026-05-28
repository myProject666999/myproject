package com.carbon.emission.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("import_batch")
public class ImportBatch {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String batchNo;

    private String batchName;

    private Integer importType;

    private Long orgId;

    private Integer totalCount;

    private Integer successCount;

    private Integer failCount;

    private String importFile;

    private String errorLog;

    private Integer importStatus;

    @TableLogic
    private Integer deleted;

    private String createBy;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
