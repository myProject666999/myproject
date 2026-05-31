package com.port.container.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.port.container.entity.SysUser;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {
}
