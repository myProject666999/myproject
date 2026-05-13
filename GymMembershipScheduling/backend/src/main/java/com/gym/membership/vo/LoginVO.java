package com.gym.membership.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LoginVO {
    private String token;
    private Long userId;
    private String username;
    private String realName;
    private String role;
    private String roleName;
    private String avatar;
    private LocalDateTime loginTime;
}
