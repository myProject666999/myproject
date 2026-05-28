package com.creator.platform.controller;

import com.creator.platform.common.Result;
import com.creator.platform.sync.DataSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@Slf4j
@RestController
@RequestMapping("/sync")
@RequiredArgsConstructor
public class SyncController {

    private final DataSyncService dataSyncService;

    @PostMapping("/account")
    public Result<Void> syncAccountData(@RequestParam Long accountId) {
        try {
            dataSyncService.syncAccountData(accountId);
            return Result.success();
        } catch (Exception e) {
            log.error("手动同步账号数据失败", e);
            return Result.error("同步失败: " + e.getMessage());
        }
    }

    @PostMapping("/content")
    public Result<Void> syncContentData(
            @RequestParam Long accountId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        try {
            dataSyncService.syncContentData(accountId, startDate, endDate);
            return Result.success();
        } catch (Exception e) {
            log.error("手动同步内容数据失败", e);
            return Result.error("同步失败: " + e.getMessage());
        }
    }

    @PostMapping("/all")
    public Result<Void> syncAllData(@RequestParam Long creatorId) {
        try {
            var accounts = dataSyncService.getActiveAccounts();
            for (var account : accounts) {
                if (account.getCreatorId().equals(creatorId)) {
                    dataSyncService.syncAccountData(account.getId());
                    LocalDate endDate = LocalDate.now();
                    LocalDate startDate = endDate.minusDays(7);
                    dataSyncService.syncContentData(account.getId(), startDate, endDate);
                }
            }
            return Result.success();
        } catch (Exception e) {
            log.error("手动同步全部数据失败", e);
            return Result.error("同步失败: " + e.getMessage());
        }
    }
}
