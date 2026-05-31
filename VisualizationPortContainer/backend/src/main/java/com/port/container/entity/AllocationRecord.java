package com.port.container.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("allocation_record")
public class AllocationRecord implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private String allocationNo;

    private Long containerId;

    private String containerNo;

    private Long yardId;

    private String yardCode;

    private Long slotId;

    private String slotCode;

    private String allocationStrategy;

    private Integer status;

    private LocalDateTime allocateTime;

    private LocalDateTime cancelTime;

    private String reason;

    private Long operatorId;

    private String operatorName;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
