package com.creator.platform.sync;

import com.creator.platform.entity.CreatorAccount;
import com.creator.platform.entity.SyncTask;
import com.creator.platform.enums.SyncStatusEnum;
import com.creator.platform.enums.TaskTypeEnum;
import com.creator.platform.mapper.SyncTaskMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SyncScheduleTask {

    private final DataSyncService dataSyncService;
    private final SyncTaskMapper syncTaskMapper;

    @Scheduled(cron = "0 0 2 * * ?")
    public void syncAllAccountData() {
        log.info("开始执行全量账号数据同步定时任务");
        List<CreatorAccount> accounts = dataSyncService.getActiveAccounts();
        for (CreatorAccount account : accounts) {
            try {
                dataSyncService.syncAccountData(account.getId());
            } catch (Exception e) {
                log.error("账号数据同步失败, accountId: {}", account.getId(), e);
            }
        }
        log.info("全量账号数据同步定时任务执行完成");
    }

    @Scheduled(cron = "0 0 3 * * ?")
    public void syncAllContentData() {
        log.info("开始执行全量内容数据同步定时任务");
        List<CreatorAccount> accounts = dataSyncService.getActiveAccounts();
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(7);

        for (CreatorAccount account : accounts) {
            try {
                dataSyncService.syncContentData(account.getId(), startDate, endDate);
            } catch (Exception e) {
                log.error("内容数据同步失败, accountId: {}", account.getId(), e);
            }
        }
        log.info("全量内容数据同步定时任务执行完成");
    }

    @Scheduled(cron = "0 */30 * * * ?")
    public void retryFailedTasks() {
        log.info("开始执行失败任务重试");
        List<SyncTask> failedTasks = syncTaskMapper.selectList(
                new LambdaQueryWrapper<SyncTask>()
                        .eq(SyncTask::getStatus, SyncStatusEnum.FAILED.getCode())
                        .apply("retry_count < max_retry")
                        .apply("DATE(create_time) = DATE(NOW())")
        );

        for (SyncTask task : failedTasks) {
            try {
                if (TaskTypeEnum.ACCOUNT_DATA.getCode().equals(task.getTaskType())) {
                    dataSyncService.syncAccountData(task.getAccountId());
                } else if (TaskTypeEnum.CONTENT_DATA.getCode().equals(task.getTaskType())) {
                    LocalDate endDate = LocalDate.now();
                    LocalDate startDate = endDate.minusDays(7);
                    dataSyncService.syncContentData(task.getAccountId(), startDate, endDate);
                }
            } catch (Exception e) {
                log.error("任务重试失败, taskId: {}", task.getId(), e);
            }
        }
        log.info("失败任务重试执行完成, 处理任务数: {}", failedTasks.size());
    }
}
