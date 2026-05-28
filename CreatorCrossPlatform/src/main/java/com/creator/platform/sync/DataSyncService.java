package com.creator.platform.sync;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.creator.platform.dto.PlatformAccountDataDTO;
import com.creator.platform.dto.PlatformContentDTO;
import com.creator.platform.dto.UnifiedMetricsDTO;
import com.creator.platform.entity.*;
import com.creator.platform.enums.PlatformCodeEnum;
import com.creator.platform.enums.SyncStatusEnum;
import com.creator.platform.enums.TaskTypeEnum;
import com.creator.platform.mapper.*;
import com.creator.platform.normalize.DataNormalizeService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataSyncService {

    private final List<PlatformApiClient> apiClients;
    private final DataNormalizeService dataNormalizeService;

    private final CreatorAccountMapper creatorAccountMapper;
    private final PlatformMapper platformMapper;
    private final AccountDailyMetricsMapper accountDailyMetricsMapper;
    private final ContentMapper contentMapper;
    private final ContentMetricsMapper contentMetricsMapper;
    private final SyncTaskMapper syncTaskMapper;
    private final PlatformRawDataMapper platformRawDataMapper;

    private Map<String, PlatformApiClient> clientMap;

    @PostConstruct
    public void init() {
        clientMap = apiClients.stream()
                .collect(Collectors.toMap(PlatformApiClient::getPlatformCode, Function.identity()));
    }

    @Retryable(value = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000, multiplier = 2))
    @Transactional(rollbackFor = Exception.class)
    public void syncAccountData(Long creatorAccountId) throws Exception {
        CreatorAccount account = creatorAccountMapper.selectById(creatorAccountId);
        if (account == null) {
            throw new IllegalArgumentException("账号不存在: " + creatorAccountId);
        }

        SyncTask task = createSyncTask(account, TaskTypeEnum.ACCOUNT_DATA, LocalDate.now());
        try {
            updateTaskStatus(task, SyncStatusEnum.EXECUTING, null);

            Platform platform = platformMapper.selectById(account.getPlatformId());
            PlatformApiClient client = clientMap.get(platform.getPlatformCode());
            if (client == null) {
                throw new IllegalArgumentException("不支持的平台: " + platform.getPlatformCode());
            }

            PlatformAccountDataDTO rawData = client.fetchAccountData(
                    account.getPlatformAccountId(),
                    account.getAccessToken()
            );

            savePlatformRawData(account, "ACCOUNT_STATS", rawData, LocalDate.now());

            UnifiedMetricsDTO unified = dataNormalizeService.normalizeAccountData(rawData);
            unified.setCreatorId(account.getCreatorId());
            unified.setAccountId(account.getId());
            unified.setPlatformId(account.getPlatformId());
            unified.setStatDate(LocalDate.now());

            AccountDailyMetrics metrics = dataNormalizeService.convertToAccountDailyMetrics(
                    unified,
                    account.getCreatorId(),
                    account.getId(),
                    account.getPlatformId()
            );

            saveOrUpdateAccountDailyMetrics(metrics);

            account.setLastSyncTime(LocalDateTime.now());
            account.setSyncStatus(SyncStatusEnum.SUCCESS.getCode());
            creatorAccountMapper.updateById(account);

            updateTaskStatus(task, SyncStatusEnum.SUCCESS, null);
            log.info("账号数据同步成功: accountId={}, platform={}", account.getId(), platform.getPlatformCode());

        } catch (Exception e) {
            log.error("账号数据同步失败: accountId={}", creatorAccountId, e);
            updateTaskStatus(task, SyncStatusEnum.FAILED, e.getMessage());
            account.setSyncStatus(SyncStatusEnum.FAILED.getCode());
            creatorAccountMapper.updateById(account);
            throw e;
        }
    }

    @Retryable(value = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000, multiplier = 2))
    @Transactional(rollbackFor = Exception.class)
    public void syncContentData(Long creatorAccountId, LocalDate startDate, LocalDate endDate) throws Exception {
        CreatorAccount account = creatorAccountMapper.selectById(creatorAccountId);
        if (account == null) {
            throw new IllegalArgumentException("账号不存在: " + creatorAccountId);
        }

        SyncTask task = createSyncTask(account, TaskTypeEnum.CONTENT_DATA, LocalDate.now());
        try {
            updateTaskStatus(task, SyncStatusEnum.EXECUTING, null);

            Platform platform = platformMapper.selectById(account.getPlatformId());
            PlatformApiClient client = clientMap.get(platform.getPlatformCode());
            if (client == null) {
                throw new IllegalArgumentException("不支持的平台: " + platform.getPlatformCode());
            }

            List<PlatformContentDTO> contentList = client.fetchContentList(
                    account.getPlatformAccountId(),
                    account.getAccessToken(),
                    startDate,
                    endDate
            );

            for (PlatformContentDTO contentDTO : contentList) {
                savePlatformRawData(account, "CONTENT_STATS", contentDTO, contentDTO.getPublishTime().toLocalDate());

                Content content = dataNormalizeService.convertToContent(
                        contentDTO,
                        account.getCreatorId(),
                        account.getId(),
                        account.getPlatformId()
                );

                Content existingContent = contentMapper.selectOne(
                        new LambdaQueryWrapper<Content>()
                                .eq(Content::getAccountId, account.getId())
                                .eq(Content::getPlatformContentId, contentDTO.getPlatformContentId())
                );

                Long contentId;
                if (existingContent == null) {
                    contentMapper.insert(content);
                    contentId = content.getId();
                } else {
                    content.setId(existingContent.getId());
                    contentMapper.updateById(content);
                    contentId = existingContent.getId();
                }

                UnifiedMetricsDTO unified = dataNormalizeService.normalizeContentData(contentDTO);
                ContentMetrics metrics = dataNormalizeService.convertToContentMetrics(
                        unified,
                        contentId,
                        account.getCreatorId(),
                        account.getId(),
                        account.getPlatformId()
                );

                saveOrUpdateContentMetrics(metrics);
            }

            updateTaskStatus(task, SyncStatusEnum.SUCCESS, null);
            log.info("内容数据同步成功: accountId={}, platform={}, count={}",
                    account.getId(), platform.getPlatformCode(), contentList.size());

        } catch (Exception e) {
            log.error("内容数据同步失败: accountId={}", creatorAccountId, e);
            updateTaskStatus(task, SyncStatusEnum.FAILED, e.getMessage());
            throw e;
        }
    }

    private SyncTask createSyncTask(CreatorAccount account, TaskTypeEnum taskType, LocalDate syncDate) {
        SyncTask task = new SyncTask();
        task.setTaskType(taskType.getCode());
        task.setAccountId(account.getId());
        task.setCreatorId(account.getCreatorId());
        task.setSyncDate(syncDate);
        task.setStatus(SyncStatusEnum.PENDING.getCode());
        task.setRetryCount(0);
        task.setMaxRetry(3);
        task.setExecuteStartTime(LocalDateTime.now());
        syncTaskMapper.insert(task);
        return task;
    }

    private void updateTaskStatus(SyncTask task, SyncStatusEnum status, String errorMessage) {
        task.setStatus(status.getCode());
        if (status == SyncStatusEnum.FAILED) {
            task.setRetryCount(task.getRetryCount() + 1);
            task.setErrorMessage(errorMessage);
        }
        if (status == SyncStatusEnum.SUCCESS || status == SyncStatusEnum.FAILED) {
            task.setExecuteEndTime(LocalDateTime.now());
        }
        syncTaskMapper.updateById(task);
    }

    private void saveOrUpdateAccountDailyMetrics(AccountDailyMetrics metrics) {
        AccountDailyMetrics existing = accountDailyMetricsMapper.selectOne(
                new LambdaQueryWrapper<AccountDailyMetrics>()
                        .eq(AccountDailyMetrics::getAccountId, metrics.getAccountId())
                        .eq(AccountDailyMetrics::getStatDate, metrics.getStatDate())
        );

        if (existing == null) {
            accountDailyMetricsMapper.insert(metrics);
        } else {
            metrics.setId(existing.getId());
            accountDailyMetricsMapper.updateById(metrics);
        }
    }

    private void saveOrUpdateContentMetrics(ContentMetrics metrics) {
        ContentMetrics existing = contentMetricsMapper.selectOne(
                new LambdaQueryWrapper<ContentMetrics>()
                        .eq(ContentMetrics::getContentId, metrics.getContentId())
        );

        if (existing == null) {
            contentMetricsMapper.insert(metrics);
        } else {
            metrics.setId(existing.getId());
            contentMetricsMapper.updateById(metrics);
        }
    }

    private void savePlatformRawData(CreatorAccount account, String dataType, Object data, LocalDate dataDate) {
        try {
            PlatformRawData rawData = new PlatformRawData();
            rawData.setPlatformId(account.getPlatformId());
            rawData.setAccountId(account.getId());
            rawData.setDataType(dataType);
            rawData.setRawData(com.alibaba.fastjson2.JSON.toJSONString(data));
            rawData.setFetchTime(LocalDateTime.now());
            rawData.setDataDate(dataDate);
            platformRawDataMapper.insert(rawData);
        } catch (Exception e) {
            log.warn("保存原始数据失败", e);
        }
    }

    public List<CreatorAccount> getActiveAccounts() {
        return creatorAccountMapper.selectList(
                new LambdaQueryWrapper<CreatorAccount>()
                        .eq(CreatorAccount::getStatus, 1)
        );
    }
}
