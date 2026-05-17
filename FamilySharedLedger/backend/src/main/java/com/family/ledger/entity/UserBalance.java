package com.family.ledger.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("user_balance")
public class UserBalance {
    private Long id;
    private Long familyId;
    private Long userId;
    private BigDecimal totalPaid;
    private BigDecimal totalShare;
    private BigDecimal balance;
    private LocalDateTime updateTime;
}
