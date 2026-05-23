package com.oj.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("submission")
public class Submission {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long problemId;
    private Long contestId;
    private String language;
    private String code;
    private Integer status;
    private Integer score;
    private Integer timeUsed;
    private Integer memoryUsed;
    private Integer caseCount;
    private Integer totalCase;
    private String errorMsg;
    private LocalDateTime createTime;
    @TableField(exist = false)
    private User user;
    @TableField(exist = false)
    private Problem problem;
    @TableField(exist = false)
    private String statusText;
}
