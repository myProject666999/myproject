package com.construction.company.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("contract")
public class Contract {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long customerId;
    private Long quotationId;
    private String contractNo;
    private BigDecimal contractAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer status;
    private LocalDate signDate;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
