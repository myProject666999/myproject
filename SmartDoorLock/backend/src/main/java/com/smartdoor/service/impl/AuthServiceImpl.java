package com.smartdoor.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.smartdoor.common.Result;
import com.smartdoor.common.ResultCode;
import com.smartdoor.dto.LoginDTO;
import com.smartdoor.dto.LoginVO;
import com.smartdoor.entity.SysUser;
import com.smartdoor.exception.BusinessException;
import com.smartdoor.mapper.SysUserMapper;
import com.smartdoor.service.AuthService;
import com.smartdoor.utils.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.util.concurrent.TimeUnit;

@Service
public class AuthServiceImpl implements AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Override
    public Result<LoginVO> login(LoginDTO loginDTO) {
        SysUser user = sysUserMapper.selectOne(
                new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getUsername, loginDTO.getUsername())
        );

        if (user == null) {
            throw new BusinessException(ResultCode.PASSWORD_ERROR);
        }

        String md5Password = DigestUtils.md5DigestAsHex(loginDTO.getPassword().getBytes());
        if (!md5Password.equals(user.getPassword())) {
            throw new BusinessException(ResultCode.PASSWORD_ERROR);
        }

        if (user.getStatus() != 1) {
            throw new BusinessException(ResultCode.ACCOUNT_DISABLED);
        }

        String token = jwtUtils.generateToken(user.getId(), user.getUsername(), user.getRole());

        stringRedisTemplate.opsForValue().set("token:" + token, user.getId().toString(),
                jwtUtils.getExpireTime(), TimeUnit.MILLISECONDS);

        log.info("用户登录成功: {}", user.getUsername());

        return Result.success(new LoginVO(token, user.getId(), user.getUsername(),
                user.getRealName(), user.getRole()));
    }

    @Override
    public Result<Void> logout() {
        return Result.success();
    }
}
