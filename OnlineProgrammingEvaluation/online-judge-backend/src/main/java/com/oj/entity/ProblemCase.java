package com.oj.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("problem_case")
public class ProblemCase {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long problemId;
    private String input;
    private String output;
    private Integer isSample;
    private LocalDateTime createTime;
}
