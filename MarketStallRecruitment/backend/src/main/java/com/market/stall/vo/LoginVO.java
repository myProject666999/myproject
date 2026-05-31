package com.market.stall.vo;

import lombok.Data;

@Data
public class LoginVO {

    private String token;

    private Long userId;

    private String username;

    private Integer role;

    private String realName;
}
