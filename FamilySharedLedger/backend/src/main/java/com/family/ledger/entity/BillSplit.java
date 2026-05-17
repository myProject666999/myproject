package com.family.ledger.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("bill_split")
public class BillSplit {
    private Long id;
    private Long billId;
    private Long userId;
    private BigDecimal amount;
    private BigDecimal ratio;
    private Integer isSettled;
    private Long settleId;
    private LocalDateTime createTime;
}
