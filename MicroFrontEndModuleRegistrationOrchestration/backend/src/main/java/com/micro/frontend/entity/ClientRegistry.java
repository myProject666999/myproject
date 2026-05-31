package com.micro.frontend.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;

@Data
@TableName("client_registry")
public class ClientRegistry {

    private Long id;

    private String clientId;

    private String clientType;

    private String appCode;

    private String appVersion;

    private Integer configVersion;

    private String ipAddress;

    private String userAgent;

    private String userId;

    private Date lastHeartbeat;

    private Integer status;

    private Date createdAt;

    private Date updatedAt;
}
