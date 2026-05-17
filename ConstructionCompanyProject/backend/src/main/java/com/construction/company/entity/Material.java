package com.construction.company.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("material")
public class Material {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String materialName;
    private String materialCode;
    private String specification;
    private String unit;
    private BigDecimal unitPrice;
    private String supplier;
    private Integer stock;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
