package com.carbon.emission.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("sys_organization")
public class Organization {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String orgCode;

    private String orgName;

    private Long parentId;

    private Integer orgLevel;

    private Integer orgType;

    private String address;

    private String contactPerson;

    private String contactPhone;

    private Integer sortOrder;

    private Integer status;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableField(exist = false)
    private List<Organization> children;
}
