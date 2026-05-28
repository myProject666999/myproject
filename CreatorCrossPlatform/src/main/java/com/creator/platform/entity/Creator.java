package com.creator.platform.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.creator.platform.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("creator")
public class Creator extends BaseEntity {

    private String creatorName;

    private String creatorAvatar;

    private String phone;

    private String email;

    private Integer status;
}
