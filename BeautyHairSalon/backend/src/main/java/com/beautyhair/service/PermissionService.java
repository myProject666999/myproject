
package com.beautyhair.service;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beautyhair.common.PageResult;
import com.beautyhair.entity.SysPermission;
import com.beautyhair.mapper.SysPermissionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private final SysPermissionMapper sysPermissionMapper;

    public PageResult<SysPermission> getPermissionPage(int page, int size, String permissionName, Integer status) {
        Page<SysPermission> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<SysPermission> wrapper = new LambdaQueryWrapper<>();

        if (StrUtil.isNotBlank(permissionName)) {
            wrapper.like(SysPermission::getPermissionName, permissionName)
                    .or().like(SysPermission::getPermissionCode, permissionName);
        }
        if (status != null) {
            wrapper.eq(SysPermission::getStatus, status);
        }
        wrapper.orderByAsc(SysPermission::getSort);

        IPage<SysPermission> result = sysPermissionMapper.selectPage(pageParam, wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal());
    }

    public List<SysPermission> getAll() {
        return sysPermissionMapper.selectList(
                new LambdaQueryWrapper<SysPermission>()
                        .eq(SysPermission::getStatus, 1)
                        .orderByAsc(SysPermission::getSort)
        );
    }

    public SysPermission getById(Long id) {
        return sysPermissionMapper.selectById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void add(SysPermission permission) {
        if (permission.getStatus() == null) {
            permission.setStatus(1);
        }
        if (permission.getSort() == null) {
            permission.setSort(0);
        }
        sysPermissionMapper.insert(permission);
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(SysPermission permission) {
        sysPermissionMapper.updateById(permission);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        sysPermissionMapper.deleteById(id);
    }
}
