package com.oj.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("contest_user")
public class ContestUser {
    @TableId(type = IdType.INPUT)
    private Long contestId;
    @TableId(type = IdType.INPUT)
    private Long userId;
    private Integer rank;
    private Integer solvedCount;
    private Integer penalty;
    private LocalDateTime joinTime;
    @TableField(exist = false)
    private User user;
}
