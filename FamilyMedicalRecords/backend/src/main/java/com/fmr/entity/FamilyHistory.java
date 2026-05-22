package com.fmr.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("family_history")
public class FamilyHistory {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long memberId;
    private String disease;
    private String relation;
    private String relativeName;
    private Integer onsetAge;
    private Integer isHereditary;
    private String remark;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
