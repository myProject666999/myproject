package com.project.cost.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("proj_project_member")
public class ProjectMember {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long projectId;
    private Long userId;
    private String role;
    private Integer hourlyRate;
    private LocalDate joinDate;
    private LocalDate leaveDate;
    private LocalDateTime createTime;
}
