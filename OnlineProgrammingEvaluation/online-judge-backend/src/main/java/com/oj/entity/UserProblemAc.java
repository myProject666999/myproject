package com.oj.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("user_problem_ac")
public class UserProblemAc {
    private Long userId;
    private Long problemId;
    private Long submissionId;
    private LocalDateTime acTime;
}
