package com.micro.frontend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("gray_user")
public class GrayUser {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("gray_release_id")
    private Long grayReleaseId;

    @TableField("user_id")
    private String userId;

    @TableField("user_name")
    private String userName;

    @TableField("user_type")
    private String userType;

    @TableField("created_at")
    private LocalDateTime createdAt;
}
