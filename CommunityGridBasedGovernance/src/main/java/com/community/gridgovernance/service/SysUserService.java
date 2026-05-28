package com.community.gridgovernance.service;

import com.community.gridgovernance.entity.SysUser;
import com.community.gridgovernance.repository.SysUserRepository;
import com.community.gridgovernance.util.CacheUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class SysUserService {

    @Autowired
    private SysUserRepository sysUserRepository;

    @Autowired
    private CacheUtil cacheUtil;

    private static final String USER_CACHE_PREFIX = "user:info:";

    public SysUser login(String username, String password) {
        Optional<SysUser> userOpt = sysUserRepository.findByUsernameAndPassword(username, password);
        if (userOpt.isPresent()) {
            SysUser user = userOpt.get();
            if (user.getStatus() != 1) {
                throw new IllegalArgumentException("用户已被禁用");
            }
            return user;
        }
        throw new IllegalArgumentException("用户名或密码错误");
    }

    public SysUser getById(Long id) {
        String cacheKey = USER_CACHE_PREFIX + id;
        Object cached = cacheUtil.get(cacheKey);
        if (cached != null) {
            return (SysUser) cached;
        }
        SysUser user = sysUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));
        cacheUtil.set(cacheKey, user, 1, TimeUnit.HOURS);
        return user;
    }

    public List<SysUser> getAllGridWorkers() {
        return sysUserRepository.findByRoleType("GRID_WORKER");
    }

    public List<SysUser> getGridWorkersByGridId(Long gridId) {
        return sysUserRepository.findByGridIdAndRoleType(gridId, "GRID_WORKER");
    }

    public List<SysUser> getAllUsers() {
        return sysUserRepository.findAll();
    }
}
