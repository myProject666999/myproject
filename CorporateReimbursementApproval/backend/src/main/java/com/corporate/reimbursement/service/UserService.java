package com.corporate.reimbursement.service;

import com.corporate.reimbursement.entity.SysUser;

public interface UserService {

    SysUser login(String username, String password);

    SysUser getUserInfo(Long userId);
}