package com.bmi.tracking.service;

import com.bmi.tracking.entity.User;

import java.util.Map;

public interface UserService {
    Map<String, Object> login(String username, String password);
    void register(String username, String password, String nickname);
    User getCurrentUser();
    void updateHeight(java.math.BigDecimal height);
}
