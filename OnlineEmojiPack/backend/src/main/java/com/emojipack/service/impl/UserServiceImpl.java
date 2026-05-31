package com.emojipack.service.impl;

import com.emojipack.common.BusinessException;
import com.emojipack.dto.LoginDTO;
import com.emojipack.dto.RegisterDTO;
import com.emojipack.entity.User;
import com.emojipack.mapper.UserMapper;
import com.emojipack.service.UserService;
import com.emojipack.util.JwtUtil;
import com.emojipack.vo.LoginVO;
import com.emojipack.vo.UserVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public LoginVO login(LoginDTO dto) {
        User user = userMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<User>()
                        .eq("username", dto.getUsername())
        );
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        if (user.getStatus() != 1) {
            throw new BusinessException("用户已被禁用");
        }
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BusinessException("密码错误");
        }
        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        LoginVO vo = new LoginVO();
        vo.setToken(token);
        vo.setUser(convertToVO(user));
        return vo;
    }

    @Override
    public UserVO register(RegisterDTO dto) {
        User existUser = userMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<User>()
                        .eq("username", dto.getUsername())
        );
        if (existUser != null) {
            throw new BusinessException("用户名已存在");
        }
        User user = new User();
        BeanUtils.copyProperties(dto, user);
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setStatus(1);
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());
        userMapper.insert(user);
        return convertToVO(user);
    }

    @Override
    public UserVO getUserInfo(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        return convertToVO(user);
    }

    @Override
    public UserVO updateUser(Long userId, User user) {
        User existUser = userMapper.selectById(userId);
        if (existUser == null) {
            throw new BusinessException("用户不存在");
        }
        if (user.getNickname() != null) {
            existUser.setNickname(user.getNickname());
        }
        if (user.getAvatar() != null) {
            existUser.setAvatar(user.getAvatar());
        }
        if (user.getEmail() != null) {
            existUser.setEmail(user.getEmail());
        }
        if (user.getPhone() != null) {
            existUser.setPhone(user.getPhone());
        }
        existUser.setUpdateTime(LocalDateTime.now());
        userMapper.updateById(existUser);
        return convertToVO(existUser);
    }

    @Override
    public User getById(Long id) {
        return userMapper.selectById(id);
    }

    private UserVO convertToVO(User user) {
        UserVO vo = new UserVO();
        BeanUtils.copyProperties(user, vo);
        return vo;
    }
}
