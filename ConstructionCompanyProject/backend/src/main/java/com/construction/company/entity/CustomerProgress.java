package com.construction.company.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("customer_progress")
public class CustomerProgress {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long projectId;
    private Long nodeId;
    private LocalDate progressDate;
    private String content;
    private String photoUrls;
    private Long customerId;
    private String customerSignature;
    private Integer status;
    private String customerFeedback;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
