package com.oj.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("contest_problem")
public class ContestProblem {
    private Long contestId;
    private Long problemId;
    private Integer orderIndex;
}
