package com.gym.membership.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gym.membership.common.PageResult;
import com.gym.membership.dto.LoginDTO;
import com.gym.membership.dto.UserRegisterDTO;
import com.gym.membership.entity.Role;
import com.gym.membership.entity.User;
import com.gym.membership.entity.UserRole;
import com.gym.membership.exception.BusinessException;
import com.gym.membership.mapper.RoleMapper;
import com.gym.membership.mapper.UserMapper;
import com.gym.membership.mapper.UserRoleMapper;
import com.gym.membership.security.JwtTokenUtil;
import com.gym.membership.vo.LoginVO;
import com.gym.membership.vo.UserVO;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Service
public class UserService extends ServiceImpl<UserMapper, User> {

    private final UserRoleMapper userRoleMapper;
    private final RoleMapper roleMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;

    public UserService(UserRoleMapper userRoleMapper, RoleMapper roleMapper,
                       PasswordEncoder passwordEncoder, JwtTokenUtil jwtTokenUtil) {
        this.userRoleMapper = userRoleMapper;
        this.roleMapper = roleMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    public LoginVO login(LoginDTO dto) {
        User user = this.getOne(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, dto.getUsername())
                .eq(User::getStatus, 1));

        if (user == null) {
            throw new BusinessException("用户不存在或已被禁用");
        }

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BusinessException("密码错误");
        }

        UserRole userRole = userRoleMapper.selectOne(new LambdaQueryWrapper<UserRole>()
                .eq(UserRole::getUserId, user.getId()));

        if (userRole == null) {
            throw new BusinessException("用户未分配角色");
        }

        Role role = roleMapper.selectById(userRole.getRoleId());

        String token = jwtTokenUtil.generateToken(user.getUsername(), user.getId(), role.getRoleCode());

        LoginVO vo = new LoginVO();
        vo.setToken(token);
        vo.setUserId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setRealName(user.getRealName());
        vo.setRole(role.getRoleCode());
        vo.setRoleName(role.getRoleName());
        vo.setAvatar(user.getAvatar());
        vo.setLoginTime(LocalDateTime.now());

        return vo;
    }

    @Transactional(rollbackFor = Exception.class)
    public void register(UserRegisterDTO dto) {
        User existUser = this.getOne(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, dto.getUsername()));
        if (existUser != null) {
            throw new BusinessException("用户名已存在");
        }

        existUser = this.getOne(new LambdaQueryWrapper<User>()
                .eq(User::getPhone, dto.getPhone()));
        if (existUser != null) {
            throw new BusinessException("手机号已被使用");
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRealName(dto.getRealName());
        user.setPhone(dto.getPhone());
        user.setEmail(dto.getEmail());
        user.setStatus(1);
        this.save(user);

        UserRole userRole = new UserRole();
        userRole.setUserId(user.getId());
        userRole.setRoleId(dto.getRoleId());
        userRoleMapper.insert(userRole);
    }

    public PageResult<UserVO> getUserPage(Long pageNum, Long pageSize, String keyword, Integer status) {
        Page<User> page = new Page<>(pageNum, pageSize);

        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(User::getUsername, keyword)
                    .or().like(User::getRealName, keyword)
                    .or().like(User::getPhone, keyword));
        }
        if (status != null) {
            wrapper.eq(User::getStatus, status);
        }
        wrapper.orderByDesc(User::getCreateTime);

        IPage<User> userPage = this.page(page, wrapper);

        PageResult<UserVO> result = new PageResult<>();
        result.setTotal(userPage.getTotal());
        result.setPages(userPage.getPages());
        result.setCurrent(userPage.getCurrent());
        result.setSize(userPage.getSize());
        result.setRecords(userPage.getRecords().stream().map(this::convertToVO).collect(java.util.stream.Collectors.toList()));

        return result;
    }

    private UserVO convertToVO(User user) {
        UserVO vo = new UserVO();
        vo.setId(user.getId());
        vo.setUsername(user.getUsername());
        vo.setRealName(user.getRealName());
        vo.setPhone(user.getPhone());
        vo.setEmail(user.getEmail());
        vo.setAvatar(user.getAvatar());
        vo.setStatus(user.getStatus());
        vo.setCreateTime(user.getCreateTime());

        UserRole userRole = userRoleMapper.selectOne(new LambdaQueryWrapper<UserRole>()
                .eq(UserRole::getUserId, user.getId()));
        if (userRole != null) {
            Role role = roleMapper.selectById(userRole.getRoleId());
            if (role != null) {
                vo.setRole(role.getRoleCode());
                vo.setRoleName(role.getRoleName());
            }
        }

        return vo;
    }

    public UserVO getUserById(Long id) {
        User user = this.getById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        return convertToVO(user);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateUser(Long id, UserRegisterDTO dto) {
        User user = this.getById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        if (StringUtils.hasText(dto.getUsername()) && !dto.getUsername().equals(user.getUsername())) {
            User existUser = this.getOne(new LambdaQueryWrapper<User>()
                    .eq(User::getUsername, dto.getUsername()));
            if (existUser != null) {
                throw new BusinessException("用户名已存在");
            }
            user.setUsername(dto.getUsername());
        }

        if (StringUtils.hasText(dto.getPassword())) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        user.setRealName(dto.getRealName());
        user.setPhone(dto.getPhone());
        user.setEmail(dto.getEmail());
        this.updateById(user);

        if (dto.getRoleId() != null) {
            UserRole oldRole = userRoleMapper.selectOne(new LambdaQueryWrapper<UserRole>()
                    .eq(UserRole::getUserId, id));
            if (oldRole != null) {
                oldRole.setRoleId(dto.getRoleId());
                userRoleMapper.updateById(oldRole);
            } else {
                UserRole newRole = new UserRole();
                newRole.setUserId(id);
                newRole.setRoleId(dto.getRoleId());
                userRoleMapper.insert(newRole);
            }
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteUser(Long id) {
        this.removeById(id);
        userRoleMapper.delete(new LambdaQueryWrapper<UserRole>().eq(UserRole::getUserId, id));
    }

    public void updateStatus(Long id, Integer status) {
        User user = this.getById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        user.setStatus(status);
        this.updateById(user);
    }

    public java.util.List<Role> getRoleList() {
        return roleMapper.selectList(new LambdaQueryWrapper<Role>().eq(Role::getStatus, 1));
    }

    public java.util.List<UserVO> getCoachList() {
        java.util.List<UserRole> userRoles = userRoleMapper.selectList(new LambdaQueryWrapper<UserRole>()
                .inSql(UserRole::getRoleId, "SELECT id FROM role WHERE role_code = 'COACH'"));

        java.util.List<Long> coachIds = userRoles.stream()
                .map(UserRole::getUserId)
                .collect(java.util.stream.Collectors.toList());

        if (coachIds.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        java.util.List<User> users = this.listByIds(coachIds);
        return users.stream().map(this::convertToVO).collect(java.util.stream.Collectors.toList());
    }

    public java.util.List<UserVO> getMemberList() {
        java.util.List<UserRole> userRoles = userRoleMapper.selectList(new LambdaQueryWrapper<UserRole>()
                .inSql(UserRole::getRoleId, "SELECT id FROM role WHERE role_code = 'MEMBER'"));

        java.util.List<Long> memberIds = userRoles.stream()
                .map(UserRole::getUserId)
                .collect(java.util.stream.Collectors.toList());

        if (memberIds.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        java.util.List<User> users = this.listByIds(memberIds);
        return users.stream().map(this::convertToVO).collect(java.util.stream.Collectors.toList());
    }
}
