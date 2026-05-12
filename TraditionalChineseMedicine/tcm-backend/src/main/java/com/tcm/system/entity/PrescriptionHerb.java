package com.tcm.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;

@Data
@TableName("prescription_herb")
public class PrescriptionHerb {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long prescriptionId;
    private Long herbId;
    private String herbName;
    private BigDecimal dosage;
    private String note;
    private Integer sortOrder;
}
