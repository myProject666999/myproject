package com.onsiterepair.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("grab_record")
public class GrabRecord {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long orderId;
    private Long workerId;
    private BigDecimal distance;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime grabTime;
    
    private Integer isSuccess;
}
