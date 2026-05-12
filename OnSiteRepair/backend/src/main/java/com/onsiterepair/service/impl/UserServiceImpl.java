package com.onsiterepair.service.impl;

import cn.hutool.crypto.digest.BCrypt;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.onsiterepair.dto.LoginDTO;
import com.onsiterepair.dto.RegisterDTO;
import com.onsiterepair.entity.User;
import com.onsiterepair.exception.BusinessException;
import com.onsiterepair.mapper.UserMapper;
import com.onsiterepair.service.UserService;
import com.onsiterepair.utils.JwtUtils;
import com.onsiterepair.vo.LoginVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    private final JwtUtils jwtUtils;

    @Override
    public LoginVO login(LoginDTO dto) {
        User user = getByPhone(dto.getPhone());
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        if (user.getStatus() == 0) {
            throw new BusinessException("账号已被禁用");
        }
        if (!BCrypt.checkpw(dto.getPassword(), user.getPassword())) {
            throw new BusinessException("密码错误");
        }
        return buildLoginVO(user);
    }

    @Override
    public LoginVO register(RegisterDTO dto) {
        User existUser = getByPhone(dto.getPhone());
        if (existUser != null) {
            throw new BusinessException("手机号已注册");
        }
        User user = new User();
        user.setPhone(dto.getPhone());
        user.setPassword(BCrypt.hashpw(dto.getPassword()));
        user.setNickname(dto.getNickname() != null ? dto.getNickname() : "用户" + dto.getPhone().substring(7));
        user.setStatus(1);
        save(user);
        return buildLoginVO(user);
    }

    @Override
    public User getByPhone(String phone) {
        return getOne(new LambdaQueryWrapper<User>().eq(User::getPhone, phone));
    }

    @Override
    public User updateProfile(Long userId, User user) {
        User existUser = getById(userId);
        if (existUser == null) {
            throw new BusinessException("用户不存在");
        }
        if (user.getNickname() != null) {
            existUser.setNickname(user.getNickname());
        }
        if (user.getAvatar() != null) {
            existUser.setAvatar(user.getAvatar());
        }
        if (user.getRealName() != null) {
            existUser.setRealName(user.getRealName());
        }
        if (user.getGender() != null) {
            existUser.setGender(user.getGender());
        }
        updateById(existUser);
        return existUser;
    }

    private LoginVO buildLoginVO(User user) {
        LoginVO vo = new LoginVO();
        vo.setId(user.getId());
        vo.setPhone(user.getPhone());
        vo.setNickname(user.getNickname());
        vo.setAvatar(user.getAvatar());
        vo.setToken(jwtUtils.generateToken(user.getId(), 1));
        vo.setUserType(1);
        return vo;
    }
}
