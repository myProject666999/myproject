package com.project.cost.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("sys_approval_record")
public class ApprovalRecord {
    @TableId(type = IdType.AUTO)
    private Long recordId;
    private String flowType;
    private Long businessId;
    private Long approverId;
    private Integer approveOrder;
    private Integer approvalStatus;
    private String approvalComment;
    private LocalDateTime approvalTime;
}
