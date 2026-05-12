
package com.beautyhair.security;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.beautyhair.entity.SysUser;
import com.beautyhair.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final SysUserMapper sysUserMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        SysUser user = sysUserMapper.selectOne(
                new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getUsername, username)
        );

        if (user == null) {
            throw new UsernameNotFoundException("用户不存在");
        }

        if (user.getStatus() != 1) {
            throw new UsernameNotFoundException("用户已被禁用");
        }

        List<String> permissions = sysUserMapper.selectPermissionCodesByUserId(user.getId());
        permissions = permissions == null ? new ArrayList<>() : permissions;

        List<String> roleCodes = sysUserMapper.selectRoleCodesByUserId(user.getId());
        roleCodes = roleCodes == null ? new ArrayList<>() : roleCodes;

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        authorities.addAll(permissions.stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList()));
        authorities.addAll(roleCodes.stream().map(code -> "ROLE_" + code).map(SimpleGrantedAuthority::new).collect(Collectors.toList()));

        return new User(
                user.getUsername(),
                user.getPassword(),
                authorities
        );
    }
}
