package com.survey.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.survey.common.BusinessException;
import com.survey.common.ErrorCode;
import com.survey.common.JwtTokenUtil;
import com.survey.dto.LoginDTO;
import com.survey.dto.RegisterDTO;
import com.survey.dto.UserVO;
import com.survey.entity.User;
import com.survey.mapper.UserMapper;
import com.survey.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final JwtTokenUtil jwtTokenUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${jwt.header:Authorization}")
    private String header;

    @Value("${jwt.prefix:Bearer }")
    private String prefix;

    @Override
    public User login(LoginDTO loginDTO) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, loginDTO.getUsername());
        User user = userMapper.selectOne(wrapper);

        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.PASSWORD_ERROR);
        }

        if (user.getStatus() != null && user.getStatus() == 0) {
            throw new BusinessException(ErrorCode.USER_DISABLED);
        }

        return user;
    }

    @Override
    public User register(RegisterDTO registerDTO) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, registerDTO.getUsername());
        Long count = userMapper.selectCount(wrapper);

        if (count != null && count > 0) {
            throw new BusinessException(ErrorCode.USER_ALREADY_EXISTS);
        }

        User user = new User();
        BeanUtils.copyProperties(registerDTO, user);
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        user.setStatus(1);
        userMapper.insert(user);

        return user;
    }

    @Override
    public User getById(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        return user;
    }

    @Override
    public UserVO getCurrentUser(HttpServletRequest request) {
        String authHeader = request.getHeader(header);
        if (authHeader == null || !authHeader.startsWith(prefix)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        String token = authHeader.substring(prefix.length());
        Long userId = jwtTokenUtil.getUserIdFromToken(token);

        if (userId == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        User user = getById(userId);
        UserVO vo = new UserVO();
        BeanUtils.copyProperties(user, vo);
        vo.setToken(token);
        return vo;
    }
}
