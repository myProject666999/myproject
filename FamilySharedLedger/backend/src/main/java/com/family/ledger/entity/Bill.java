package com.family.ledger.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("bill")
public class Bill {
    private Long id;
    private String title;
    private BigDecimal amount;
    private String category;
    private Long familyId;
    private Long payerId;
    private Integer splitType;
    private LocalDate billDate;
    private String remark;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
