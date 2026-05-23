package com.oj.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.oj.common.BusinessException;
import com.oj.common.Constants;
import com.oj.common.ResultCode;
import com.oj.dto.LoginDTO;
import com.oj.dto.RegisterDTO;
import com.oj.entity.User;
import com.oj.mapper.UserMapper;
import com.oj.service.UserService;
import com.oj.util.JwtUtil;
import jakarta.annotation.Resource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Resource
    private PasswordEncoder passwordEncoder;

    @Resource
    private JwtUtil jwtUtil;

    @Override
    public User login(LoginDTO loginDTO) {
        User user = this.getOne(new LambdaQueryWrapper<User>().eq(User::getUsername, loginDTO.getUsername()));
        if (user == null) {
            throw new BusinessException(ResultCode.USERNAME_OR_PASSWORD_ERROR);
        }
        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            throw new BusinessException(ResultCode.USERNAME_OR_PASSWORD_ERROR);
        }
        if (user.getStatus() == Constants.UserStatus.DISABLED) {
            throw new BusinessException("账号已被禁用");
        }
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());
        user.setPassword(null);
        user.setToken(token);
        return user;
    }

    @Override
    public User register(RegisterDTO registerDTO) {
        Long count = this.count(new LambdaQueryWrapper<User>().eq(User::getUsername, registerDTO.getUsername()));
        if (count > 0) {
            throw new BusinessException(ResultCode.USER_ALREADY_EXISTS);
        }
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        user.setNickname(StringUtils.hasText(registerDTO.getNickname()) ? registerDTO.getNickname() : registerDTO.getUsername());
        user.setEmail(registerDTO.getEmail());
        user.setRole(Constants.UserRole.NORMAL);
        user.setStatus(Constants.UserStatus.NORMAL);
        user.setSolvedCount(0);
        user.setSubmitCount(0);
        user.setRating(1500);
        this.save(user);
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());
        user.setPassword(null);
        user.setToken(token);
        return user;
    }

    @Override
    public User getUserInfo(Long userId) {
        User user = this.getById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }
        user.setPassword(null);
        return user;
    }

    @Override
    public IPage<User> getUserPage(int page, int size, String keyword) {
        Page<User> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(User::getUsername, keyword).or().like(User::getNickname, keyword);
        }
        wrapper.orderByDesc(User::getRating);
        return this.page(pageParam, wrapper);
    }

    @Override
    public void updateUser(User user) {
        User dbUser = this.getById(user.getId());
        if (dbUser == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }
        if (StringUtils.hasText(user.getNickname())) {
            dbUser.setNickname(user.getNickname());
        }
        if (StringUtils.hasText(user.getEmail())) {
            dbUser.setEmail(user.getEmail());
        }
        if (StringUtils.hasText(user.getAvatar())) {
            dbUser.setAvatar(user.getAvatar());
        }
        this.updateById(dbUser);
    }

    @Override
    public void updateStatus(Long userId, Integer status) {
        User user = this.getById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }
        user.setStatus(status);
        this.updateById(user);
    }

    @Override
    public void updateRole(Long userId, Integer role) {
        User user = this.getById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }
        user.setRole(role);
        this.updateById(user);
    }
}
