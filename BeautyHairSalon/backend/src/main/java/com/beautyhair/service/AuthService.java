
package com.beautyhair.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.beautyhair.config.JwtConfig;
import com.beautyhair.dto.LoginDTO;
import com.beautyhair.dto.LoginUserVO;
import com.beautyhair.dto.SysPermissionVO;
import com.beautyhair.entity.SysPermission;
import com.beautyhair.entity.SysUser;
import com.beautyhair.mapper.SysPermissionMapper;
import com.beautyhair.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtConfig jwtConfig;
    private final SysUserMapper sysUserMapper;
    private final SysPermissionMapper sysPermissionMapper;
    private final PasswordEncoder passwordEncoder;

    public LoginUserVO login(LoginDTO loginDTO) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDTO.getUsername(),
                        loginDTO.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        SysUser user = sysUserMapper.selectOne(
                new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getUsername, loginDTO.getUsername())
        );

        String token = jwtConfig.generateToken(user.getUsername(), user.getId());

        LoginUserVO vo = new LoginUserVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setNickname(user.getNickname());
        vo.setPhone(user.getPhone());
        vo.setAvatar(user.getAvatar());
        vo.setToken(token);

        List<String> roleCodes = sysUserMapper.selectRoleCodesByUserId(user.getId());
        vo.setRoles(roleCodes);

        List<String> permissions = sysUserMapper.selectPermissionCodesByUserId(user.getId());
        vo.setPermissions(permissions);

        List<SysPermission> menuList = sysPermissionMapper.selectPermissionsByUserId(user.getId());
        vo.setMenus(buildMenuTree(menuList));

        return vo;
    }

    public LoginUserVO getCurrentUserInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        SysUser user = sysUserMapper.selectOne(
                new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getUsername, username)
        );

        LoginUserVO vo = new LoginUserVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setNickname(user.getNickname());
        vo.setPhone(user.getPhone());
        vo.setAvatar(user.getAvatar());

        List<String> roleCodes = sysUserMapper.selectRoleCodesByUserId(user.getId());
        vo.setRoles(roleCodes);

        List<String> permissions = sysUserMapper.selectPermissionCodesByUserId(user.getId());
        vo.setPermissions(permissions);

        List<SysPermission> menuList = sysPermissionMapper.selectPermissionsByUserId(user.getId());
        vo.setMenus(buildMenuTree(menuList));

        return vo;
    }

    private List<SysPermissionVO> buildMenuTree(List<SysPermission> permissions) {
        if (permissions == null || permissions.isEmpty()) {
            return new ArrayList<>();
        }

        List<SysPermission> menus = permissions.stream()
                .filter(p -> p.getType() == 1)
                .collect(Collectors.toList());

        Map<Long, SysPermissionVO> map = new HashMap<>();
        List<SysPermissionVO> roots = new ArrayList<>();

        for (SysPermission menu : menus) {
            SysPermissionVO vo = new SysPermissionVO();
            BeanUtils.copyProperties(menu, vo);
            map.put(menu.getId(), vo);
        }

        for (SysPermission menu : menus) {
            SysPermissionVO vo = map.get(menu.getId());
            if (menu.getParentId() == 0) {
                roots.add(vo);
            } else {
                SysPermissionVO parent = map.get(menu.getParentId());
                if (parent != null) {
                    if (parent.getChildren() == null) {
                        parent.setChildren(new ArrayList<>());
                    }
                    parent.getChildren().add(vo);
                }
            }
        }

        return roots.stream()
                .sorted(Comparator.comparing(SysPermissionVO::getSort, Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());
    }
}
