package com.project.cost.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("sys_approval_flow")
public class ApprovalFlow {
    @TableId(type = IdType.AUTO)
    private Long flowId;
    private String flowName;
    private String flowType;
    private Long deptId;
    private Long projectId;
    private Integer approverOrder;
    private Long approverId;
    private Integer status;
    private LocalDateTime createTime;
}
