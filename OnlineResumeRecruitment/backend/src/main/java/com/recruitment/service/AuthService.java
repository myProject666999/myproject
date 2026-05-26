package com.recruitment.service;

import com.recruitment.dto.LoginDTO;
import com.recruitment.dto.RegisterDTO;
import com.recruitment.entity.User;
import com.recruitment.exception.BusinessException;
import com.recruitment.mapper.UserMapper;
import com.recruitment.security.JwtTokenUtil;
import com.recruitment.vo.LoginVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    public LoginVO login(LoginDTO dto) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(dto.getUsername(), dto.getPassword())
        );
        if (!authentication.isAuthenticated()) {
            throw new BusinessException("用户名或密码错误");
        }
        UserDetails userDetails = userDetailsService.loadUserByUsername(dto.getUsername());
        String token = jwtTokenUtil.generateToken(userDetails);
        User user = userMapper.selectByUsername(dto.getUsername());
        if (user.getStatus() != null && user.getStatus() == 0) {
            throw new BusinessException("账号已被禁用");
        }
        user.setPassword(null);
        return new LoginVO(token, user);
    }

    @Transactional(rollbackFor = Exception.class)
    public User register(RegisterDTO dto) {
        User existUser = userMapper.selectByUsername(dto.getUsername());
        if (existUser != null) {
            throw new BusinessException("用户名已存在");
        }
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setRole(dto.getRole());
        user.setStatus(1);
        user.setDeleted(0);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.insert(user);
        user.setPassword(null);
        return user;
    }
}
