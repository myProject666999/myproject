package com.community.gridgovernance.service;

import com.community.gridgovernance.dto.WorkOrderReportDTO;
import com.community.gridgovernance.entity.GridInfo;
import com.community.gridgovernance.entity.SysUser;
import com.community.gridgovernance.entity.WorkOrder;
import com.community.gridgovernance.enums.OrderStatusEnum;
import com.community.gridgovernance.enums.OperationTypeEnum;
import com.community.gridgovernance.repository.WorkOrderRepository;
import com.community.gridgovernance.util.CacheUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class WorkOrderService {

    @Autowired
    private WorkOrderRepository workOrderRepository;

    @Autowired
    private GridInfoService gridInfoService;

    @Autowired
    private SysUserService sysUserService;

    @Autowired
    private WorkOrderLogService workOrderLogService;

    @Autowired
    private CacheUtil cacheUtil;

    @Value("${order.timeout.normal:24}")
    private int normalTimeout;

    @Value("${order.timeout.high:12}")
    private int highTimeout;

    @Value("${order.timeout.urgent:4}")
    private int urgentTimeout;

    private static final String ORDER_CACHE_PREFIX = "order:info:";
    private static final Random RANDOM = new Random();

    @Transactional
    public WorkOrder reportOrder(WorkOrderReportDTO dto) {
        GridInfo grid = gridInfoService.findGridByLocation(dto.getLng(), dto.getLat());
        if (grid == null) {
            throw new IllegalArgumentException("当前位置不在任何网格范围内，请确认位置信息");
        }

        WorkOrder order = new WorkOrder();
        order.setOrderNo(generateOrderNo());
        order.setTitle(dto.getTitle());
        order.setDescription(dto.getDescription());
        order.setOrderType(dto.getOrderType());
        order.setLevel(dto.getLevel() != null ? dto.getLevel() : "NORMAL");
        order.setStatus(OrderStatusEnum.PENDING.getCode());
        order.setReporterId(dto.getReporterId());
        order.setReporterName(dto.getReporterName());
        order.setReporterPhone(dto.getReporterPhone());
        order.setGridId(grid.getId());
        order.setLng(dto.getLng());
        order.setLat(dto.getLat());
        order.setAddress(dto.getAddress());
        order.setBeforeImages(dto.getBeforeImages());

        order = workOrderRepository.save(order);

        workOrderLogService.createLog(
                order.getId(),
                dto.getReporterId(),
                dto.getReporterName(),
                OperationTypeEnum.CREATE.getCode(),
                null,
                OrderStatusEnum.PENDING.getCode(),
                "居民上报工单",
                dto.getBeforeImages()
        );

        autoAssignOrder(order, grid);

        return order;
    }

    @Transactional
    public void autoAssignOrder(WorkOrder order, GridInfo grid) {
        List<SysUser> workers = sysUserService.getGridWorkersByGridId(grid.getId());
        if (workers.isEmpty()) {
            log.warn("网格{}没有配置网格员，工单{}将保持待派单状态", grid.getGridCode(), order.getOrderNo());
            return;
        }

        SysUser assignedWorker = workers.get(RANDOM.nextInt(workers.size()));

        order.setGridWorkerId(assignedWorker.getId());
        order.setGridWorkerName(assignedWorker.getRealName());
        order.setStatus(OrderStatusEnum.ASSIGNED.getCode());
        order.setAssignTime(LocalDateTime.now());
        order.setExpectCompleteTime(calculateExpectTime(order.getLevel()));

        workOrderRepository.save(order);

        workOrderLogService.createLog(
                order.getId(),
                assignedWorker.getId(),
                assignedWorker.getRealName(),
                OperationTypeEnum.ASSIGN.getCode(),
                OrderStatusEnum.PENDING.getCode(),
                OrderStatusEnum.ASSIGNED.getCode(),
                "系统自动派单至网格员：" + assignedWorker.getRealName(),
                null
        );

        log.info("工单{}已自动派单至网格员{}", order.getOrderNo(), assignedWorker.getRealName());
    }

    @Transactional
    public WorkOrder acceptOrder(Long orderId, Long workerId) {
        WorkOrder order = getOrderById(orderId);

        if (!OrderStatusEnum.ASSIGNED.getCode().equals(order.getStatus())) {
            throw new IllegalArgumentException("当前工单状态不允许接单");
        }

        if (!order.getGridWorkerId().equals(workerId)) {
            throw new IllegalArgumentException("该工单不属于您，无法接单");
        }

        SysUser worker = sysUserService.getById(workerId);
        String beforeStatus = order.getStatus();

        order.setStatus(OrderStatusEnum.PROCESSING.getCode());
        order.setProcessStartTime(LocalDateTime.now());
        order = workOrderRepository.save(order);

        workOrderLogService.createLog(
                orderId,
                workerId,
                worker.getRealName(),
                OperationTypeEnum.ACCEPT.getCode(),
                beforeStatus,
                order.getStatus(),
                "网格员已接单，开始处理",
                null
        );

        evictOrderCache(orderId);
        return order;
    }

    @Transactional
    public WorkOrder processOrder(Long orderId, Long operatorId, String processResult,
                                   String afterImages, String remark) {
        WorkOrder order = getOrderById(orderId);

        if (!OrderStatusEnum.PROCESSING.getCode().equals(order.getStatus()) &&
            !OrderStatusEnum.ESCALATED.getCode().equals(order.getStatus())) {
            throw new IllegalArgumentException("当前工单状态不允许处理");
        }

        SysUser operator = sysUserService.getById(operatorId);
        String beforeStatus = order.getStatus();

        order.setProcessResult(processResult);
        order.setAfterImages(afterImages);
        order.setStatus(OrderStatusEnum.COMPLETED.getCode());
        order.setCompleteTime(LocalDateTime.now());
        order = workOrderRepository.save(order);

        workOrderLogService.createLog(
                orderId,
                operatorId,
                operator.getRealName(),
                OperationTypeEnum.PROCESS.getCode(),
                beforeStatus,
                order.getStatus(),
                remark,
                afterImages
        );

        evictOrderCache(orderId);
        return order;
    }

    @Transactional
    public WorkOrder escalateOrder(Long orderId, Long operatorId, String remark) {
        WorkOrder order = getOrderById(orderId);

        if (!OrderStatusEnum.PROCESSING.getCode().equals(order.getStatus()) &&
            !OrderStatusEnum.ASSIGNED.getCode().equals(order.getStatus())) {
            throw new IllegalArgumentException("当前工单状态不允许升级");
        }

        SysUser operator = sysUserService.getById(operatorId);
        String beforeStatus = order.getStatus();

        order.setStatus(OrderStatusEnum.ESCALATED.getCode());
        order.setEscalationCount(order.getEscalationCount() + 1);
        order.setLastEscalationTime(LocalDateTime.now());
        order = workOrderRepository.save(order);

        workOrderLogService.createLog(
                orderId,
                operatorId,
                operator.getRealName(),
                OperationTypeEnum.ESCALATE.getCode(),
                beforeStatus,
                order.getStatus(),
                "工单升级原因：" + remark,
                null
        );

        evictOrderCache(orderId);
        log.warn("工单{}已升级，当前升级次数：{}", order.getOrderNo(), order.getEscalationCount());
        return order;
    }

    public WorkOrder getOrderById(Long id) {
        String cacheKey = ORDER_CACHE_PREFIX + id;
        Object cached = cacheUtil.get(cacheKey);
        if (cached != null) {
            return (WorkOrder) cached;
        }
        WorkOrder order = workOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("工单不存在"));
        cacheUtil.set(cacheKey, order, 30, TimeUnit.MINUTES);
        return order;
    }

    public List<WorkOrder> getOrdersByReporter(Long reporterId) {
        return workOrderRepository.findByReporterIdOrderByCreateTimeDesc(reporterId);
    }

    public List<WorkOrder> getOrdersByWorker(Long workerId) {
        return workOrderRepository.findByGridWorkerIdOrderByCreateTimeDesc(workerId);
    }

    public List<WorkOrder> getOrdersByStatus(String status) {
        return workOrderRepository.findByStatusOrderByCreateTimeDesc(status);
    }

    public List<WorkOrder> getAllOrders() {
        return workOrderRepository.findAll();
    }

    public List<WorkOrder> getPendingOrders() {
        return workOrderRepository.findByStatusInOrderByCreateTimeDesc(
                Arrays.asList(OrderStatusEnum.PENDING.getCode(),
                        OrderStatusEnum.ASSIGNED.getCode(),
                        OrderStatusEnum.PROCESSING.getCode(),
                        OrderStatusEnum.ESCALATED.getCode())
        );
    }

    private String generateOrderNo() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int randomPart = RANDOM.nextInt(10000);
        return "WO" + datePart + String.format("%04d", randomPart);
    }

    private LocalDateTime calculateExpectTime(String level) {
        int hours = normalTimeout;
        switch (level) {
            case "URGENT":
                hours = urgentTimeout;
                break;
            case "HIGH":
                hours = highTimeout;
                break;
            default:
                hours = normalTimeout;
        }
        return LocalDateTime.now().plusHours(hours);
    }

    private void evictOrderCache(Long orderId) {
        cacheUtil.delete(ORDER_CACHE_PREFIX + orderId);
    }
}
