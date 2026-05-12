
package com.beautyhair.service;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beautyhair.common.PageResult;
import com.beautyhair.entity.SysUser;
import com.beautyhair.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final SysUserMapper sysUserMapper;
    private final PasswordEncoder passwordEncoder;

    public PageResult<SysUser> getUserPage(int page, int size, String username, String nickname, Integer status) {
        Page<SysUser> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();

        if (StrUtil.isNotBlank(username)) {
            wrapper.like(SysUser::getUsername, username);
        }
        if (StrUtil.isNotBlank(nickname)) {
            wrapper.like(SysUser::getNickname, nickname);
        }
        if (status != null) {
            wrapper.eq(SysUser::getStatus, status);
        }
        wrapper.orderByDesc(SysUser::getCreateTime);

        IPage<SysUser> result = sysUserMapper.selectPage(pageParam, wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal());
    }

    public SysUser getById(Long id) {
        return sysUserMapper.selectById(id);
    }

    public SysUser getByUsername(String username) {
        return sysUserMapper.selectOne(
                new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getUsername, username)
                        .eq(SysUser::getStatus, 1)
        );
    }

    public List<SysUser> getAll() {
        return sysUserMapper.selectList(
                new LambdaQueryWrapper<SysUser>().eq(SysUser::getStatus, 1)
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public void add(SysUser user) {
        if (StrUtil.isBlank(user.getPassword())) {
            user.setPassword("123456");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getStatus() == null) {
            user.setStatus(1);
        }
        sysUserMapper.insert(user);
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(SysUser user) {
        if (StrUtil.isNotBlank(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        sysUserMapper.updateById(user);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        sysUserMapper.deleteById(id);
    }
}
