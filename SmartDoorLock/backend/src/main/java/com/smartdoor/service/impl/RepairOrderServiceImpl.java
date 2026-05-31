package com.smartdoor.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.entity.RepairOrder;
import com.smartdoor.exception.BusinessException;
import com.smartdoor.mapper.RepairOrderMapper;
import com.smartdoor.service.NotificationService;
import com.smartdoor.service.RepairOrderService;
import com.smartdoor.utils.PasswordGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class RepairOrderServiceImpl extends ServiceImpl<RepairOrderMapper, RepairOrder> implements RepairOrderService {
    private static final Logger log = LoggerFactory.getLogger(RepairOrderServiceImpl.class);

    @Autowired
    private NotificationService notificationService;

    @Override
    public Result<PageResult<RepairOrder>> getOrderPage(int pageNum, int pageSize, String orderNo, Long tenantId,
                                                          Long apartmentId, String repairType, String priority, String status, String keyword) {
        LambdaQueryWrapper<RepairOrder> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(orderNo)) {
            wrapper.like(RepairOrder::getOrderNo, orderNo);
        }
        if (tenantId != null) {
            wrapper.eq(RepairOrder::getTenantId, tenantId);
        }
        if (apartmentId != null) {
            wrapper.eq(RepairOrder::getApartmentId, apartmentId);
        }
        if (StringUtils.hasText(repairType)) {
            wrapper.eq(RepairOrder::getRepairType, repairType);
        }
        if (StringUtils.hasText(priority)) {
            wrapper.eq(RepairOrder::getPriority, priority);
        }
        if (StringUtils.hasText(status)) {
            wrapper.eq(RepairOrder::getStatus, status);
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(RepairOrder::getTitle, keyword)
                    .or().like(RepairOrder::getDescription, keyword)
                    .or().like(RepairOrder::getTenantName, keyword));
        }

        wrapper.orderByDesc(RepairOrder::getCreateTime);

        Page<RepairOrder> page = this.page(new Page<>(pageNum, pageSize), wrapper);

        return Result.success(new PageResult<>(page.getTotal(), page.getRecords(), pageNum, pageSize));
    }

    @Override
    public Result<RepairOrder> getOrderDetail(Long id) {
        RepairOrder order = this.getById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        return Result.success(order);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> createOrder(RepairOrder order) {
        order.setOrderNo(PasswordGenerator.generateOrderNo());
        order.setReportTime(LocalDateTime.now());
        order.setStatus("PENDING");
        if (!StringUtils.hasText(order.getPriority())) {
            order.setPriority("NORMAL");
        }

        this.save(order);

        notificationService.sendNotification(
                "OPERATOR",
                null,
                "运营人员",
                null,
                "REPAIR_STATUS",
                "新报修工单提醒",
                "有新的报修工单需要处理：" + order.getTitle() + "，租客：" + order.getTenantName(),
                "SYSTEM",
                "REPAIR",
                order.getId()
        );

        log.info("创建报修工单: orderNo={}, tenant={}", order.getOrderNo(), order.getTenantName());
        return Result.success();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> assignOrder(Long id, Long assigneeId, String assigneeName) {
        RepairOrder order = this.getById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (!"PENDING".equals(order.getStatus())) {
            throw new BusinessException("只有待分配状态的工单才能分配");
        }

        order.setAssigneeId(assigneeId);
        order.setAssigneeName(assigneeName);
        order.setAssignTime(LocalDateTime.now());
        order.setStatus("ASSIGNED");

        this.updateById(order);

        notificationService.sendNotification(
                "OPERATOR",
                assigneeId,
                assigneeName,
                null,
                "REPAIR_STATUS",
                "工单分配通知",
                "您有新的报修工单需要处理：" + order.getTitle(),
                "SYSTEM",
                "REPAIR",
                order.getId()
        );

        if (order.getTenantId() != null) {
            notificationService.sendNotification(
                    "TENANT",
                    order.getTenantId(),
                    order.getTenantName(),
                    null,
                    "REPAIR_STATUS",
                    "报修工单进度通知",
                    "您的报修工单已分配处理人：" + assigneeName + "，将尽快为您处理。",
                    "SYSTEM",
                    "REPAIR",
                    order.getId()
            );
        }

        log.info("分配工单: orderNo={}, assignee={}", order.getOrderNo(), assigneeName);
        return Result.success();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> startProcess(Long id, String processDescription) {
        RepairOrder order = this.getById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (!"ASSIGNED".equals(order.getStatus())) {
            throw new BusinessException("只有已分配状态的工单才能开始处理");
        }

        order.setProcessStartTime(LocalDateTime.now());
        order.setProcessDescription(processDescription);
        order.setStatus("PROCESSING");

        this.updateById(order);

        if (order.getTenantId() != null) {
            notificationService.sendNotification(
                    "TENANT",
                    order.getTenantId(),
                    order.getTenantName(),
                    null,
                    "REPAIR_STATUS",
                    "报修工单进度通知",
                    "您的报修工单已开始处理：" + processDescription,
                    "SYSTEM",
                    "REPAIR",
                    order.getId()
            );
        }

        log.info("开始处理工单: orderNo={}", order.getOrderNo());
        return Result.success();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> completeOrder(Long id, String processDescription, BigDecimal costAmount, String costBearer) {
        RepairOrder order = this.getById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (!"PROCESSING".equals(order.getStatus())) {
            throw new BusinessException("只有处理中状态的工单才能完成");
        }

        order.setProcessDescription(processDescription);
        order.setCostAmount(costAmount != null ? costAmount : BigDecimal.ZERO);
        order.setCostBearer(costBearer != null ? costBearer : "OWNER");
        order.setCompleteTime(LocalDateTime.now());
        order.setStatus("COMPLETED");

        this.updateById(order);

        if (order.getTenantId() != null) {
            notificationService.sendNotification(
                    "TENANT",
                    order.getTenantId(),
                    order.getTenantName(),
                    null,
                    "REPAIR_STATUS",
                    "报修工单完成通知",
                    "您的报修工单已处理完成，请确认是否满意。",
                    "SYSTEM",
                    "REPAIR",
                    order.getId()
            );
        }

        log.info("完成工单: orderNo={}", order.getOrderNo());
        return Result.success();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> cancelOrder(Long id, String reason) {
        RepairOrder order = this.getById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if ("COMPLETED".equals(order.getStatus()) || "CANCELLED".equals(order.getStatus())) {
            throw new BusinessException("该工单已完成或已取消");
        }

        order.setStatus("CANCELLED");
        order.setRemark(order.getRemark() != null ? order.getRemark() + " 取消原因: " + reason : "取消原因: " + reason);

        this.updateById(order);

        log.info("取消工单: orderNo={}, reason={}", order.getOrderNo(), reason);
        return Result.success();
    }

    @Override
    public Result<Void> evaluateOrder(Long id, Integer satisfactionScore, String satisfactionComment) {
        RepairOrder order = this.getById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (!"COMPLETED".equals(order.getStatus())) {
            throw new BusinessException("只有已完成状态的工单才能评价");
        }

        order.setSatisfactionScore(satisfactionScore);
        order.setSatisfactionComment(satisfactionComment);

        this.updateById(order);

        log.info("评价工单: orderNo={}, score={}", order.getOrderNo(), satisfactionScore);
        return Result.success();
    }
}
