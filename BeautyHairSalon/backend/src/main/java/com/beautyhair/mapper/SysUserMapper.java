
package com.beautyhair.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beautyhair.entity.SysUser;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface SysUserMapper extends BaseMapper<SysUser> {

    @Select("SELECT r.role_code FROM sys_user_role ur " +
            "LEFT JOIN sys_role r ON ur.role_id = r.id " +
            "WHERE ur.user_id = #{userId} AND r.deleted = 0 AND r.status = 1")
    List<String> selectRoleCodesByUserId(@Param("userId") Long userId);

    @Select("SELECT p.permission_code FROM sys_user_role ur " +
            "LEFT JOIN sys_role r ON ur.role_id = r.id " +
            "LEFT JOIN sys_role_permission rp ON r.id = rp.role_id " +
            "LEFT JOIN sys_permission p ON rp.permission_id = p.id " +
            "WHERE ur.user_id = #{userId} AND r.deleted = 0 AND r.status = 1 AND p.status = 1")
    List<String> selectPermissionCodesByUserId(@Param("userId") Long userId);
}
