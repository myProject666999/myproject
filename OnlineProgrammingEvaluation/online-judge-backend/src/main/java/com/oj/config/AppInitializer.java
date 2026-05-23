package com.oj.config;

import com.oj.judge.JudgeTaskHandler;
import com.oj.service.ContestService;
import com.oj.service.RanklistService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
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

    @PostConstruct
    public void init() {
        String workDir = System.getProperty("user.dir") + File.separator + "judge" + File.separator + "workspace";
        File dir = new File(workDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        judgeTaskHandler.handleSubmission();
        log.info("判题任务处理器已启动");
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
