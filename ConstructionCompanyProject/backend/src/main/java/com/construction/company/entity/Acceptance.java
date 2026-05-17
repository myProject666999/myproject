package com.construction.company.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("acceptance")
public class Acceptance {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long projectId;
    private Long nodeId;
    private Integer acceptanceType;
    private LocalDate acceptanceDate;
    private String inspector;
    private Long customerId;
    private Integer result;
    private String problem;
    private String rectification;
    private LocalDate rectificationDeadline;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
