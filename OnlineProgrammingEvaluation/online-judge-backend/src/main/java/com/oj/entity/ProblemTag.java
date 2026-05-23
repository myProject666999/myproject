package com.oj.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("problem_tag")
public class ProblemTag {
    private Long problemId;
    private Long tagId;
}
