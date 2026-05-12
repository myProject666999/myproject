package com.onsiterepair.vo;

import lombok.Data;

@Data
public class LoginVO {
    private Long id;
    private String phone;
    private String nickname;
    private String avatar;
    private String token;
    private Integer userType;
}
