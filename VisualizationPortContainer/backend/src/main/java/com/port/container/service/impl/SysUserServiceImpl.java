package com.port.container.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.port.container.dto.LoginDTO;
import com.port.container.entity.SysUser;
import com.port.container.mapper.SysUserMapper;
import com.port.container.service.OperationLogService;
import com.port.container.service.SysUserService;
import cn.hutool.crypto.digest.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SysUserServiceImpl extends ServiceImpl<SysUserMapper, SysUser> implements SysUserService {

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private OperationLogService operationLogService;

    private static final int USER_STATUS_NORMAL = 1;
    private static final int LOGIN_STATUS_ONLINE = 1;

    @Override
    public SysUser login(LoginDTO dto) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getUsername, dto.getUsername());
        SysUser user = sysUserMapper.selectOne(wrapper);

        if (user == null) {
            throw new RuntimeException("用户名或密码错误");
        }

        if (user.getStatus() != null && user.getStatus() != USER_STATUS_NORMAL) {
            throw new RuntimeException("账号已被禁用");
        }

        if (!BCrypt.checkpw(dto.getPassword(), user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }

        SysUser updateUser = new SysUser();
        updateUser.setId(user.getId());
        updateUser.setLastLoginTime(LocalDateTime.now());
        updateUser.setLastLoginIp(dto.getIp());
        updateUser.setLoginStatus(LOGIN_STATUS_ONLINE);
        if (user.getLoginCount() != null) {
            updateUser.setLoginCount(user.getLoginCount() + 1);
        } else {
            updateUser.setLoginCount(1);
        }
        sysUserMapper.updateById(updateUser);

        operationLogService.logOperation("用户管理", "登录", user.getId(), user.getUsername(),
                null, null, user.getId(), user.getNickname(), dto.getIp());

        user.setPassword(null);
        return user;
    }

    @Override
    public SysUser getById(Long id) {
        SysUser user = sysUserMapper.selectById(id);
        if (user != null) {
            user.setPassword(null);
        }
        return user;
    }

    @Override
    public List<SysUser> list() {
        List<SysUser> users = sysUserMapper.selectList(null);
        users.forEach(user -> user.setPassword(null));
        return users;
    }

    @Override
    public IPage<SysUser> page(Long current, Long size) {
        Page<SysUser> page = new Page<>(current, size);
        IPage<SysUser> result = sysUserMapper.selectPage(page, null);
        result.getRecords().forEach(user -> user.setPassword(null));
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean save(SysUser sysUser) {
        SysUser before = null;
        if (sysUser.getPassword() != null) {
            sysUser.setPassword(BCrypt.hashpw(sysUser.getPassword()));
        }
        int result = sysUserMapper.insert(sysUser);
        sysUser.setPassword(null);
        operationLogService.logOperation("用户管理", "新增", sysUser.getId(), sysUser.getUsername(),
                before, sysUser, null, null, null);
        return result > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean update(SysUser sysUser) {
        SysUser before = sysUserMapper.selectById(sysUser.getId());
        if (before != null) {
            before.setPassword(null);
        }
        if (sysUser.getPassword() != null && sysUser.getPassword().length() > 0) {
            sysUser.setPassword(BCrypt.hashpw(sysUser.getPassword()));
        } else {
            sysUser.setPassword(null);
        }
        int result = sysUserMapper.updateById(sysUser);
        sysUser.setPassword(null);
        operationLogService.logOperation("用户管理", "修改", sysUser.getId(), sysUser.getUsername(),
                before, sysUser, null, null, null);
        return result > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean remove(Long id) {
        SysUser before = sysUserMapper.selectById(id);
        int result = sysUserMapper.deleteById(id);
        if (before != null) {
            before.setPassword(null);
            operationLogService.logOperation("用户管理", "删除", id, before.getUsername(),
                    before, null, null, null, null);
        }
        return result > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean resetPassword(Long userId, String newPassword) {
        SysUser user = sysUserMapper.selectById(userId);
        if (user == null) {
            return false;
        }
        SysUser before = new SysUser();
        before.setId(userId);
        before.setPassword(user.getPassword());

        SysUser updateUser = new SysUser();
        updateUser.setId(userId);
        updateUser.setPassword(BCrypt.hashpw(newPassword));
        int result = sysUserMapper.updateById(updateUser);

        operationLogService.logOperation("用户管理", "重置密码", userId, user.getUsername(),
                before, "密码已重置", null, null, null);
        return result > 0;
    }
}
