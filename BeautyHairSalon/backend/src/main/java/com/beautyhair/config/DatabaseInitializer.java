
package com.beautyhair.config;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.beautyhair.entity.SysUser;
import com.beautyhair.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseInitializer implements CommandLineRunner {

    private final SysUserMapper sysUserMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            SysUser adminUser = sysUserMapper.selectOne(
                    new LambdaQueryWrapper<SysUser>()
                            .eq(SysUser::getUsername, "admin")
            );

            if (adminUser == null) {
                log.info("管理员用户不存在，正在创建...");
                SysUser user = new SysUser();
                user.setUsername("admin");
                user.setPassword(passwordEncoder.encode("123456"));
                user.setNickname("超级管理员");
                user.setPhone("13800138000");
                user.setStatus(1);
                sysUserMapper.insert(user);
                log.info("管理员用户创建成功，账号: admin, 密码: 123456");
            } else {
                log.info("管理员用户已存在");
                String rawPassword = "123456";
                if (!passwordEncoder.matches(rawPassword, adminUser.getPassword())) {
                    log.info("管理员密码不正确，正在重置为: 123456");
                    adminUser.setPassword(passwordEncoder.encode(rawPassword));
                    sysUserMapper.updateById(adminUser);
                    log.info("管理员密码重置成功");
                }
            }
        } catch (Exception e) {
            log.error("数据库初始化失败: {}", e.getMessage());
            log.error("请确保数据库 'beauty_hair_salon' 已创建并执行了 init.sql 脚本");
        }
    }
}
