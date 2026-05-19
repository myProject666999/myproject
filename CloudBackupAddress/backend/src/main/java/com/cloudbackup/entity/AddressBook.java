package com.cloudbackup.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("address_book")
public class AddressBook {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String userId;

    private String name;

    private String description;

    private Integer contactCount;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedTime;

    @TableLogic
    private Integer deleted;
}
