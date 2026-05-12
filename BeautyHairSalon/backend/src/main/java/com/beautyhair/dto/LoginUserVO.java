
package com.beautyhair.dto;

import lombok.Data;

import java.util.List;

@Data
public class LoginUserVO {
    private Long id;
    private String username;
    private String nickname;
    private String phone;
    private String avatar;
    private String token;
    private List<String> roles;
    private List<String> permissions;
    private List<SysPermissionVO> menus;
}
