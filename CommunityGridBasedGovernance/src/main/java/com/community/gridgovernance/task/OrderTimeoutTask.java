package com.community.gridgovernance.task;

import com.community.gridgovernance.entity.SysUser;
import com.community.gridgovernance.entity.WorkOrder;
import com.community.gridgovernance.enums.OrderStatusEnum;
import com.community.gridgovernance.enums.OperationTypeEnum;
import com.community.gridgovernance.repository.WorkOrderRepository;
import com.community.gridgovernance.service.SysUserService;
import com.community.gridgovernance.service.WorkOrderLogService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
public class OrderTimeoutTask {

    @Autowired
    private WorkOrderRepository workOrderRepository;

    @Autowired
    private WorkOrderLogService workOrderLogService;

    @Autowired
    private SysUserService sysUserService;

    @Scheduled(cron = "0 */5 * * * ?")
    @Transactional
    public void checkTimeoutOrders() {
        log.info("开始检测超时工单...");

        List<String> checkStatuses = Arrays.asList(
                OrderStatusEnum.ASSIGNED.getCode(),
                OrderStatusEnum.PROCESSING.getCode(),
                OrderStatusEnum.ESCALATED.getCode()
        );

        List<WorkOrder> overdueOrders = workOrderRepository.findOverdueOrders(
                checkStatuses, LocalDateTime.now());

        log.info("检测到{}个超时工单", overdueOrders.size());

        for (WorkOrder order : overdueOrders) {
            processTimeoutOrder(order);
        }

        log.info("超时工单检测完成");
    }

    @Transactional
    public void processTimeoutOrder(WorkOrder order) {
        String beforeStatus = order.getStatus();

        order.setIsOverdue(1);

        if (order.getEscalationCount() < 2) {
            order.setStatus(OrderStatusEnum.ESCALATED.getCode());
            order.setEscalationCount(order.getEscalationCount() + 1);
            order.setLastEscalationTime(LocalDateTime.now());

            String operatorName = "系统";
            Long operatorId = 1L;

            try {
                SysUser admin = sysUserService.getById(1L);
                operatorName = admin.getRealName();
            } catch (Exception e) {
                log.warn("获取管理员信息失败，使用默认值");
            }

            workOrderLogService.createLog(
                    order.getId(),
                    operatorId,
                    operatorName,
                    OperationTypeEnum.ESCALATE.getCode(),
                    beforeStatus,
                    OrderStatusEnum.ESCALATED.getCode(),
                    "工单处理超时，系统自动升级，升级次数：" + order.getEscalationCount(),
                    null
            );

            log.warn("工单{}处理超时，已自动升级，升级次数：{}",
                    order.getOrderNo(), order.getEscalationCount());
        } else {
            workOrderLogService.createLog(
                    order.getId(),
                    1L,
                    "系统",
                    OperationTypeEnum.ESCALATE.getCode(),
                    beforeStatus,
                    beforeStatus,
                    "工单处理超时，已达最大升级次数，请管理员关注",
                    null
            );

            log.warn("工单{}处理超时，已达最大升级次数(2次)，需要管理员介入",
                    order.getOrderNo());
        }

        workOrderRepository.save(order);
    }
}
