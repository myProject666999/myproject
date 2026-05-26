package com.recruitment.service;

import com.recruitment.entity.User;
import com.recruitment.exception.BusinessException;
import com.recruitment.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    public User getById(Long id) {
        User user = userMapper.selectById(id);
        if (user == null || user.getDeleted() == 1) {
            throw new BusinessException("用户不存在");
        }
        user.setPassword(null);
        return user;
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessException("用户未登录");
        }
        Object principal = authentication.getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        User user = userMapper.selectByUsername(username);
        if (user == null || user.getDeleted() == 1) {
            throw new BusinessException("用户不存在");
        }
        user.setPassword(null);
        return user;
    }

    @Transactional(rollbackFor = Exception.class)
    public User update(User user) {
        User currentUser = getCurrentUser();
        if (!currentUser.getId().equals(user.getId())) {
            throw new BusinessException("无权限修改其他用户信息");
        }
        user.setUpdatedAt(LocalDateTime.now());
        user.setPassword(null);
        user.setUsername(null);
        user.setRole(null);
        user.setStatus(null);
        user.setDeleted(null);
        user.setCreatedAt(null);
        userMapper.updateById(user);
        return getById(user.getId());
    }
}
