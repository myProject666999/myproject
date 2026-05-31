package com.port.container.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.port.container.dto.LoginDTO;
import com.port.container.entity.SysUser;

import java.util.List;

public interface SysUserService extends IService<SysUser> {

    SysUser login(LoginDTO dto);

    SysUser getById(Long id);

    List<SysUser> list();

    IPage<SysUser> page(Long current, Long size);

    boolean save(SysUser sysUser);

    boolean update(SysUser sysUser);

    boolean remove(Long id);

    boolean resetPassword(Long userId, String newPassword);
}
