package com.recycling.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.recycling.dto.LoginDTO;
import com.recycling.dto.RegisterDTO;
import com.recycling.entity.User;
import com.recycling.exception.BusinessException;
import com.recycling.mapper.UserMapper;
import com.recycling.service.UserService;
import com.recycling.utils.JwtUtils;
import com.recycling.vo.LoginVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    public LoginVO login(LoginDTO loginDTO) {
        User user = getByUsername(loginDTO.getUsername());
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        
        if (user.getStatus() != 1) {
            throw new BusinessException("用户已被禁用");
        }
        
        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            throw new BusinessException("密码错误");
        }
        
        String token = jwtUtils.generateToken(user.getId(), user.getUsername(), user.getRole());
        
        LoginVO vo = new LoginVO();
        vo.setToken(token);
        vo.setUserId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setNickname(user.getNickname());
        vo.setAvatar(user.getAvatar());
        vo.setRole(user.getRole());
        
        return vo;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public User register(RegisterDTO registerDTO) {
        if (getByUsername(registerDTO.getUsername()) != null) {
            throw new BusinessException("用户名已存在");
        }
        
        if (getByPhone(registerDTO.getPhone()) != null) {
            throw new BusinessException("手机号已被注册");
        }
        
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        user.setPhone(registerDTO.getPhone());
        user.setNickname(registerDTO.getNickname() != null ? registerDTO.getNickname() : registerDTO.getUsername());
        user.setRole("USER");
        user.setStatus(1);
        
        save(user);
        return user;
    }

    @Override
    public User getByUsername(String username) {
        return getOne(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, username)
                .eq(User::getDeleted, 0));
    }

    @Override
    public User getByPhone(String phone) {
        return getOne(new LambdaQueryWrapper<User>()
                .eq(User::getPhone, phone)
                .eq(User::getDeleted, 0));
    }
}
