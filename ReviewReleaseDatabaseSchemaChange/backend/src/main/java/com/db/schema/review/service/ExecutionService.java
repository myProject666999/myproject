package com.db.schema.review.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.db.schema.review.common.BusinessException;
import com.db.schema.review.entity.*;
import com.db.schema.review.mapper.ExecutionRecordMapper;
import com.db.schema.review.mapper.SchemaOrderMapper;
import com.db.schema.review.mapper.SchemaOrderSqlMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

@Slf4j
@Service
public class ExecutionService {

    @Autowired
    private SchemaOrderMapper orderMapper;

    @Autowired
    private SchemaOrderSqlMapper orderSqlMapper;

    @Autowired
    private ExecutionRecordMapper executionRecordMapper;

    @Autowired
    private AuditLogService auditLogService;

    private final Map<Long, AtomicBoolean> executionStopFlags = new ConcurrentHashMap<>();
    private final Map<Long, AtomicBoolean> executionPauseFlags = new ConcurrentHashMap<>();

    @Transactional(rollbackFor = Exception.class)
    public ExecutionRecord startExecution(Long orderId) {
        SchemaOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"pending_execution".equals(order.getStatus())) {
            throw new BusinessException("只有待执行状态的工单可以执行");
        }

        ExecutionRecord record = new ExecutionRecord();
        record.setOrderId(orderId);
        record.setExecutorId(5L);
        record.setExecutorName("dba1");
        record.setExecutionType("execute");
        record.setBatchNumber(1);
        record.setStatus("pending");
        record.setIsPaused(0);
        record.setStartTime(LocalDateTime.now());
        executionRecordMapper.insert(record);

        order.setStatus("executing");
        order.setActualExecuteTime(LocalDateTime.now());
        order.setCurrentBatch(1);
        orderMapper.updateById(order);

        executionStopFlags.put(record.getId(), new AtomicBoolean(false));
        executionPauseFlags.put(record.getId(), new AtomicBoolean(false));

        executeAsync(record.getId(), orderId);

        auditLogService.logExecutionOperation("start", record.getId(), order.getTitle(),
                "pending_execution", "executing", "开始执行工单");

        return record;
    }

    @Async
    public void executeAsync(Long executionId, Long orderId) {
        try {
            List<SchemaOrderSql> sqlList = orderSqlMapper.selectList(
                    new LambdaQueryWrapper<SchemaOrderSql>()
                            .eq(SchemaOrderSql::getOrderId, orderId)
                            .orderByAsc(SchemaOrderSql::getSortOrder)
            );

            ExecutionRecord record = executionRecordMapper.selectById(executionId);
            record.setStatus("executing");
            executionRecordMapper.updateById(record);

            StringBuilder executeLog = new StringBuilder();
            boolean allSuccess = true;

            for (SchemaOrderSql sqlItem : sqlList) {
                if (shouldStop(executionId)) {
                    executeLog.append("执行已中止\n");
                    allSuccess = false;
                    break;
                }

                while (isPaused(executionId)) {
                    Thread.sleep(1000);
                }

                try {
                    sqlItem.setStatus("executing");
                    orderSqlMapper.updateById(sqlItem);

                    long startTime = System.currentTimeMillis();
                    executeSql(sqlItem.getSqlContent());
                    long duration = System.currentTimeMillis() - startTime;

                    sqlItem.setStatus("success");
                    sqlItem.setExecuteTime(LocalDateTime.now());
                    sqlItem.setExecuteDuration((int) duration);
                    sqlItem.setExecuteResult("执行成功");
                    orderSqlMapper.updateById(sqlItem);

                    executeLog.append("执行成功: ").append(sqlItem.getSqlType())
                            .append(" (").append(duration).append("ms)\n");

                    updateExecutionProgress(executionId, sqlList.indexOf(sqlItem) + 1, sqlList.size());

                    Thread.sleep(500);

                } catch (Exception e) {
                    log.error("SQL执行失败", e);
                    sqlItem.setStatus("failed");
                    sqlItem.setExecuteResult("执行失败: " + e.getMessage());
                    orderSqlMapper.updateById(sqlItem);
                    executeLog.append("执行失败: ").append(e.getMessage()).append("\n");
                    allSuccess = false;
                    break;
                }
            }

            record.setEndTime(LocalDateTime.now());
            record.setDuration((int) (java.time.Duration.between(record.getStartTime(), record.getEndTime()).toMillis()));
            record.setExecuteLog(executeLog.toString());
            record.setStatus(allSuccess ? "success" : "failed");
            if (!allSuccess) {
                record.setErrorMessage("部分SQL执行失败");
            }
            executionRecordMapper.updateById(record);

            SchemaOrder order = orderMapper.selectById(orderId);
            order.setStatus(allSuccess ? "success" : "failed");
            order.setFinishTime(LocalDateTime.now());
            orderMapper.updateById(order);

            auditLogService.logExecutionOperation("complete", executionId, order.getTitle(),
                    "executing", allSuccess ? "success" : "failed",
                    allSuccess ? "工单执行成功" : "工单执行失败");

        } catch (Exception e) {
            log.error("执行线程异常", e);
            ExecutionRecord record = executionRecordMapper.selectById(executionId);
            record.setStatus("failed");
            record.setErrorMessage(e.getMessage());
            record.setEndTime(LocalDateTime.now());
            executionRecordMapper.updateById(record);

            SchemaOrder order = orderMapper.selectById(orderId);
            order.setStatus("failed");
            orderMapper.updateById(order);
        } finally {
            executionStopFlags.remove(executionId);
            executionPauseFlags.remove(executionId);
        }
    }

    private void executeSql(String sql) throws SQLException {
        String url = "jdbc:mysql://127.0.0.1:3306?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&useSSL=false";
        String username = "root";
        String password = "123456";

        try (Connection conn = DriverManager.getConnection(url, username, password);
             Statement stmt = conn.createStatement()) {
            stmt.execute(sql);
        }
    }

    public void stopExecution(Long executionId) {
        AtomicBoolean stopFlag = executionStopFlags.get(executionId);
        if (stopFlag != null) {
            stopFlag.set(true);

            ExecutionRecord record = executionRecordMapper.selectById(executionId);
            record.setStatus("stopped");
            record.setEndTime(LocalDateTime.now());
            executionRecordMapper.updateById(record);

            SchemaOrder order = orderMapper.selectById(record.getOrderId());
            order.setStatus("failed");
            orderMapper.updateById(order);

            auditLogService.logExecutionOperation("stop", executionId, order.getTitle(),
                    "executing", "stopped", "中止执行");
        }
    }

    public void pauseExecution(Long executionId) {
        AtomicBoolean pauseFlag = executionPauseFlags.get(executionId);
        if (pauseFlag != null) {
            pauseFlag.set(true);

            ExecutionRecord record = executionRecordMapper.selectById(executionId);
            record.setIsPaused(1);
            executionRecordMapper.updateById(record);

            auditLogService.logExecutionOperation("pause", executionId, "",
                    "executing", "paused", "暂停执行");
        }
    }

    public void resumeExecution(Long executionId) {
        AtomicBoolean pauseFlag = executionPauseFlags.get(executionId);
        if (pauseFlag != null) {
            pauseFlag.set(false);

            ExecutionRecord record = executionRecordMapper.selectById(executionId);
            record.setIsPaused(0);
            executionRecordMapper.updateById(record);

            auditLogService.logExecutionOperation("resume", executionId, "",
                    "paused", "executing", "恢复执行");
        }
    }

    private boolean shouldStop(Long executionId) {
        AtomicBoolean flag = executionStopFlags.get(executionId);
        return flag != null && flag.get();
    }

    private boolean isPaused(Long executionId) {
        AtomicBoolean flag = executionPauseFlags.get(executionId);
        return flag != null && flag.get();
    }

    private void updateExecutionProgress(Long executionId, int current, int total) {
    }

    public ExecutionRecord getExecutionRecord(Long executionId) {
        return executionRecordMapper.selectById(executionId);
    }

    public List<ExecutionRecord> getExecutionRecords(Long orderId) {
        return executionRecordMapper.selectList(
                new LambdaQueryWrapper<ExecutionRecord>()
                        .eq(ExecutionRecord::getOrderId, orderId)
                        .orderByDesc(ExecutionRecord::getCreateTime)
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public ExecutionRecord rollback(Long orderId) {
        SchemaOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getRollbackSql() == null || order.getRollbackSql().trim().isEmpty()) {
            throw new BusinessException("工单未设置回滚SQL");
        }

        ExecutionRecord record = new ExecutionRecord();
        record.setOrderId(orderId);
        record.setExecutorId(5L);
        record.setExecutorName("dba1");
        record.setExecutionType("rollback");
        record.setStatus("pending");
        record.setStartTime(LocalDateTime.now());
        executionRecordMapper.insert(record);

        order.setStatus("rollback");
        orderMapper.updateById(order);

        auditLogService.logExecutionOperation("rollback", record.getId(), order.getTitle(),
                order.getStatus(), "rollback", "执行回滚");

        return record;
    }
}
