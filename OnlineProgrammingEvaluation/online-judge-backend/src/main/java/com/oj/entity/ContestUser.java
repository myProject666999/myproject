package com.oj.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("contest_user")
public class ContestUser {
    private Long contestId;
    private Long userId;
    private Integer rank;
    private Integer solvedCount;
    private Integer penalty;
    private LocalDateTime joinTime;
    @TableField(exist = false)
    private User user;
}
