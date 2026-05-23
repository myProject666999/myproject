package com.oj.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("problem")
public class Problem {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String title;
    private String description;
    private String inputDesc;
    private String outputDesc;
    private String sampleInput;
    private String sampleOutput;
    private String hint;
    private Integer difficulty;
    private Integer timeLimit;
    private Integer memoryLimit;
    private Integer status;
    private Integer submitCount;
    private Integer acceptedCount;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    @TableField(exist = false)
    private List<Tag> tags;
    @TableField(exist = false)
    private List<ProblemCase> cases;
    @TableField(exist = false)
    private Integer acStatus;
}
