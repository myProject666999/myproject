package com.recruitment.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.IdType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("job_application")
public class JobApplication {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long jobId;

    private Long resumeId;

    private Long userId;

    private Long companyId;

    private Long hrId;

    private String status;

    private String resumeSnapshot;

    private String hrRemark;

    private LocalDateTime interviewTime;

    private String interviewVenue;

    private LocalDateTime appliedAt;

    private LocalDateTime viewedAt;

    private LocalDateTime processedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Integer deleted;
}
