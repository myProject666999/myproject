package com.medication.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("family_user_relation")
public class FamilyUserRelation {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long familyMemberId;

    private Long userId;

    private Integer canEdit;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
