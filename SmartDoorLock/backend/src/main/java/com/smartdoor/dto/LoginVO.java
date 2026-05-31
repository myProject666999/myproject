package com.smartdoor.dto;

import java.io.Serializable;
import java.util.Objects;

public class LoginVO implements Serializable {
    private static final long serialVersionUID = 1L;
    private String token;
    private Long userId;
    private String username;
    private String realName;
    private String role;

    public LoginVO() {
    }

    public LoginVO(String token, Long userId, String username, String realName, String role) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.realName = realName;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRealName() {
        return realName;
    }

    public void setRealName(String realName) {
        this.realName = realName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        LoginVO loginVO = (LoginVO) o;
        return Objects.equals(token, loginVO.token) &&
                Objects.equals(userId, loginVO.userId) &&
                Objects.equals(username, loginVO.username) &&
                Objects.equals(realName, loginVO.realName) &&
                Objects.equals(role, loginVO.role);
    }

    @Override
    public int hashCode() {
        return Objects.hash(token, userId, username, realName, role);
    }

    @Override
    public String toString() {
        return "LoginVO{" +
                "token='" + token + '\'' +
                ", userId=" + userId +
                ", username='" + username + '\'' +
                ", realName='" + realName + '\'' +
                ", role='" + role + '\'' +
                '}';
    }
}
