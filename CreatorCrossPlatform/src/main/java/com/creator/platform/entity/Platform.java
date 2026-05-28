package com.creator.platform.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.creator.platform.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("platform")
public class Platform extends BaseEntity {

    private String platformCode;

    private String platformName;

    private Integer status;
}
