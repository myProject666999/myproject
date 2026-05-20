package com.restaurant.evaluation.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.restaurant.evaluation.common.Result;
import com.restaurant.evaluation.dto.LoginDTO;
import com.restaurant.evaluation.entity.User;
import com.restaurant.evaluation.mapper.UserMapper;
import com.restaurant.evaluation.util.JwtUtil;
import com.restaurant.evaluation.vo.UserVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtUtil jwtUtil;

    public Result<UserVO> login(LoginDTO loginDTO) {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("username", loginDTO.getUsername());
        User user = userMapper.selectOne(wrapper);

        if (user == null) {
            return Result.error("用户不存在");
        }

        if (!loginDTO.getPassword().equals(user.getPassword())) {
            return Result.error("密码错误");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        UserVO userVO = new UserVO();
        userVO.setId(user.getId());
        userVO.setUsername(user.getUsername());
        userVO.setNickname(user.getNickname());
        userVO.setAvatar(user.getAvatar());
        userVO.setToken(token);

        return Result.success(userVO);
    }

    public Result<User> getCurrentUser(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            return Result.error("用户不存在");
        }
        user.setPassword(null);
        return Result.success(user);
    }

}
