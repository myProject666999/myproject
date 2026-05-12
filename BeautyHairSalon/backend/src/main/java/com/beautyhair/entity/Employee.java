
package com.beautyhair.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("employee")
public class Employee {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long storeId;
    private String employeeName;
    private String employeeNo;
    private String phone;
    private String position;
    private Integer isTechnician;
    private String level;
    private String speciality;
    private String avatar;
    private java.math.BigDecimal commissionRate;
    private Integer status;
    private LocalDate joinDate;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;

    @TableField(exist = false)
    private String storeName;
}
