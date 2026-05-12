
package com.beautyhair.service;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beautyhair.common.PageResult;
import com.beautyhair.entity.SysRole;
import com.beautyhair.mapper.SysRoleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final SysRoleMapper sysRoleMapper;

    public PageResult<SysRole> getRolePage(int page, int size, String roleName, Integer status) {
        Page<SysRole> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<SysRole> wrapper = new LambdaQueryWrapper<>();

        if (StrUtil.isNotBlank(roleName)) {
            wrapper.like(SysRole::getRoleName, roleName)
                    .or().like(SysRole::getRoleCode, roleName);
        }
        if (status != null) {
            wrapper.eq(SysRole::getStatus, status);
        }
        wrapper.orderByDesc(SysRole::getCreateTime);

        IPage<SysRole> result = sysRoleMapper.selectPage(pageParam, wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal());
    }

    public SysRole getById(Long id) {
        return sysRoleMapper.selectById(id);
    }

    public List<SysRole> getAll() {
        return sysRoleMapper.selectList(
                new LambdaQueryWrapper<SysRole>().eq(SysRole::getStatus, 1)
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public void add(SysRole role) {
        if (role.getStatus() == null) {
            role.setStatus(1);
        }
        sysRoleMapper.insert(role);
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(SysRole role) {
        sysRoleMapper.updateById(role);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        sysRoleMapper.deleteById(id);
    }
}
