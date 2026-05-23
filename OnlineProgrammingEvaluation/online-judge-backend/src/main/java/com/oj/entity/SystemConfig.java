package com.oj.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("system_config")
public class SystemConfig {
    private String configKey;
    private String configValue;
    private String description;
}
