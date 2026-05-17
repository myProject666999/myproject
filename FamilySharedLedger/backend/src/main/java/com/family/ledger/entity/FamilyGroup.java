package com.family.ledger.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("family_group")
public class FamilyGroup {
    private Long id;
    private String name;
    private String description;
    private Long ownerId;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
