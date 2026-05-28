package com.community.gridgovernance.service;

import com.community.gridgovernance.entity.WorkOrderLog;
import com.community.gridgovernance.repository.WorkOrderLogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
public class WorkOrderLogService {

    @Autowired
    private WorkOrderLogRepository workOrderLogRepository;

    @Transactional
    public WorkOrderLog createLog(Long orderId, Long operatorId, String operatorName,
                                   String operationType, String beforeStatus,
                                   String afterStatus, String remark, String images) {
        WorkOrderLog logEntry = new WorkOrderLog();
        logEntry.setOrderId(orderId);
        logEntry.setOperatorId(operatorId);
        logEntry.setOperatorName(operatorName);
        logEntry.setOperationType(operationType);
        logEntry.setBeforeStatus(beforeStatus);
        logEntry.setAfterStatus(afterStatus);
        logEntry.setRemark(remark);
        logEntry.setImages(images);
        return workOrderLogRepository.save(logEntry);
    }

    public List<WorkOrderLog> getOrderLogs(Long orderId) {
        return workOrderLogRepository.findByOrderIdOrderByCreateTimeAsc(orderId);
    }
}
