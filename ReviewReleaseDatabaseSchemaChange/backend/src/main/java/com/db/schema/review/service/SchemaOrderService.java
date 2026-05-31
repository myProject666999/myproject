package com.db.schema.review.service;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.db.schema.review.common.BusinessException;
import com.db.schema.review.entity.*;
import com.db.schema.review.mapper.SchemaOrderMapper;
import com.db.schema.review.mapper.SchemaOrderSqlMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class SchemaOrderService {

    @Autowired
    private SchemaOrderMapper orderMapper;

    @Autowired
    private SchemaOrderSqlMapper orderSqlMapper;

    @Autowired
    private RiskDetectionService riskDetectionService;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional(rollbackFor = Exception.class)
    public SchemaOrder createOrder(SchemaOrder order, List<String> sqlList) {
        String orderNo = generateOrderNo();
        order.setOrderNo(orderNo);
        order.setStatus("draft");
        order.setApplicantId(1L);
        order.setApplicantName("developer1");
        order.setRiskLevel("unknown");

        orderMapper.insert(order);

        int sortOrder = 0;
        for (String sql : sqlList) {
            SchemaOrderSql orderSql = new SchemaOrderSql();
            orderSql.setOrderId(order.getId());
            orderSql.setSqlContent(sql);
            orderSql.setSqlType(riskDetectionService.determineSqlType(sql));
            orderSql.setTableName(riskDetectionService.extractTableName(sql));
            orderSql.setSortOrder(sortOrder++);
            orderSql.setStatus("pending");
            orderSql.setBatchNumber(1);
            orderSql.setEstimatedRows(estimateRows(sql));
            orderSqlMapper.insert(orderSql);
        }

        auditLogService.logOrderOperation("create", order.getId(), order.getTitle(),
                null, null, "创建变更工单");

        return order;
    }

    @Transactional(rollbackFor = Exception.class)
    public void submitForReview(Long orderId) {
        SchemaOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"draft".equals(order.getStatus())) {
            throw new BusinessException("只有草稿状态的工单可以提交评审");
        }

        List<SchemaOrderSql> sqlList = orderSqlMapper.selectList(
                new LambdaQueryWrapper<SchemaOrderSql>().eq(SchemaOrderSql::getOrderId, orderId)
        );
        if (sqlList.isEmpty()) {
            throw new BusinessException("工单SQL内容不能为空");
        }

        riskDetectionService.detectRisk(order, sqlList);

        order.setStatus("pending_review");
        orderMapper.updateById(order);

        auditLogService.logOrderOperation("submit", orderId, order.getTitle(),
                "draft", "pending_review", "提交评审");
    }

    public Page<SchemaOrder> getOrderPage(int pageNum, int pageSize, String status, String applicantId) {
        LambdaQueryWrapper<SchemaOrder> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq(SchemaOrder::getStatus, status);
        }
        if (applicantId != null && !applicantId.isEmpty()) {
            wrapper.eq(SchemaOrder::getApplicantId, Long.parseLong(applicantId));
        }
        wrapper.orderByDesc(SchemaOrder::getCreateTime);
        return orderMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    public SchemaOrder getOrderDetail(Long orderId) {
        return orderMapper.selectById(orderId);
    }

    public List<SchemaOrderSql> getOrderSqlList(Long orderId) {
        return orderSqlMapper.selectList(
                new LambdaQueryWrapper<SchemaOrderSql>()
                        .eq(SchemaOrderSql::getOrderId, orderId)
                        .orderByAsc(SchemaOrderSql::getSortOrder)
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancelOrder(Long orderId) {
        SchemaOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if ("executing".equals(order.getStatus())) {
            throw new BusinessException("执行中的工单不能取消");
        }

        String oldStatus = order.getStatus();
        order.setStatus("cancelled");
        orderMapper.updateById(order);

        auditLogService.logOrderOperation("cancel", orderId, order.getTitle(),
                oldStatus, "cancelled", "取消工单");
    }

    private String generateOrderNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = IdUtil.simpleUUID().substring(0, 8).toUpperCase();
        return "SCH-" + dateStr + "-" + uuid;
    }

    private Long estimateRows(String sql) {
        String upperSql = sql.toUpperCase();
        if (upperSql.contains("UPDATE") || upperSql.contains("DELETE")) {
            return 10000L;
        }
        return 0L;
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateOrder(SchemaOrder order, List<String> sqlList) {
        SchemaOrder existing = orderMapper.selectById(order.getId());
        if (existing == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"draft".equals(existing.getStatus()) && !"need_modify".equals(existing.getStatus())) {
            throw new BusinessException("只有草稿或需修改状态的工单可以编辑");
        }

        existing.setTitle(order.getTitle());
        existing.setDescription(order.getDescription());
        existing.setEnvId(order.getEnvId());
        existing.setDbName(order.getDbName());
        existing.setPriority(order.getPriority());
        existing.setChangeType(order.getChangeType());
        existing.setIsGray(order.getIsGray());
        existing.setRollbackSql(order.getRollbackSql());
        existing.setPlanExecuteTime(order.getPlanExecuteTime());
        orderMapper.updateById(existing);

        if (sqlList != null && !sqlList.isEmpty()) {
            orderSqlMapper.delete(new LambdaQueryWrapper<SchemaOrderSql>().eq(SchemaOrderSql::getOrderId, order.getId()));

            int sortOrder = 0;
            for (String sql : sqlList) {
                SchemaOrderSql orderSql = new SchemaOrderSql();
                orderSql.setOrderId(order.getId());
                orderSql.setSqlContent(sql);
                orderSql.setSqlType(riskDetectionService.determineSqlType(sql));
                orderSql.setTableName(riskDetectionService.extractTableName(sql));
                orderSql.setSortOrder(sortOrder++);
                orderSql.setStatus("pending");
                orderSql.setBatchNumber(1);
                orderSql.setEstimatedRows(estimateRows(sql));
                orderSqlMapper.insert(orderSql);
            }
        }

        auditLogService.logOrderOperation("update", order.getId(), existing.getTitle(),
                null, null, "更新工单内容");
    }
}
