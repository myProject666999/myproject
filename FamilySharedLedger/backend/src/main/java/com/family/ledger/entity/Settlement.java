package com.family.ledger.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("settlement")
public class Settlement {
    private Long id;
    private Long familyId;
    private String title;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalAmount;
    private Integer status;
    private Long creatorId;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
