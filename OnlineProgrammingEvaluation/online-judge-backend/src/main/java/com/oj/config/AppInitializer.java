package com.oj.config;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.oj.entity.User;
import com.oj.judge.JudgeTaskHandler;
import com.oj.service.ContestService;
import com.oj.service.RanklistService;
import com.oj.service.UserService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.File;

@Slf4j
@Component
public class AppInitializer {

    @Resource
    private JudgeTaskHandler judgeTaskHandler;

    @Resource
    private ContestService contestService;

    @Resource
    private RanklistService ranklistService;

    @Resource
    private UserService userService;

    @Resource
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void init() {
        String workDir = System.getProperty("user.dir") + File.separator + "judge" + File.separator + "workspace";
        File dir = new File(workDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        initAdminUser();
        judgeTaskHandler.handleSubmission();
        log.info("判题任务处理器已启动");
    }

    private void initAdminUser() {
        User admin = userService.getOne(new LambdaQueryWrapper<User>().eq(User::getUsername, "admin"));
        if (admin == null) {
            admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setNickname("超级管理员");
            admin.setEmail("admin@oj.com");
            admin.setRole(1);
            admin.setStatus(1);
            admin.setSolvedCount(0);
            admin.setSubmitCount(0);
            admin.setRating(1500);
            userService.save(admin);
            log.info("管理员账户已创建: admin / admin123");
        } else if (!passwordEncoder.matches("admin123", admin.getPassword())) {
            admin.setPassword(passwordEncoder.encode("admin123"));
            userService.updateById(admin);
            log.info("管理员账户密码已重置为: admin123");
        }
    }

    @Scheduled(fixedRate = 60000)
    public void updateContestStatus() {
        contestService.updateContestStatus();
    }

    @Scheduled(fixedRate = 300000)
    public void refreshRanklist() {
        ranklistService.refreshRanklist();
    }
}
