package com.family.ledger.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("transfer")
public class Transfer {
    private Long id;
    private Long settleId;
    private Long fromUserId;
    private Long toUserId;
    private BigDecimal amount;
    private Integer status;
    private LocalDateTime transferTime;
    private String remark;
    private LocalDateTime createTime;
}
