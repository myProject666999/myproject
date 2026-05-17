package com.construction.company.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("material_arrival")
public class MaterialArrival {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long purchaseId;
    private LocalDate arrivalDate;
    private Integer arrivalQuantity;
    private String inspector;
    private String inspectionResult;
    private String photoUrl;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
