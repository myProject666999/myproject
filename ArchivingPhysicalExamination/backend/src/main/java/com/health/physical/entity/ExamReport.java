package com.health.physical.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("exam_report")
public class ExamReport implements Serializable {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private LocalDate examDate;

    private String hospital;

    private String reportNo;

    private String filePath;

    private String fileName;

    private String overallResult;

    private String doctor;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
