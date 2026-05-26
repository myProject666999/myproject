package com.recruitment.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.IdType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("job_favorite")
public class JobFavorite {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long jobId;

    private LocalDateTime createdAt;
}
