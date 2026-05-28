package com.community.gridgovernance.service;

import com.community.gridgovernance.dto.WorkOrderEvaluationDTO;
import com.community.gridgovernance.entity.WorkOrder;
import com.community.gridgovernance.entity.WorkOrderEvaluation;
import com.community.gridgovernance.enums.OrderStatusEnum;
import com.community.gridgovernance.enums.OperationTypeEnum;
import com.community.gridgovernance.repository.WorkOrderEvaluationRepository;
import com.community.gridgovernance.repository.WorkOrderRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
public class WorkOrderEvaluationService {

    @Autowired
    private WorkOrderEvaluationRepository evaluationRepository;

    @Autowired
    private WorkOrderRepository workOrderRepository;

    @Autowired
    private WorkOrderLogService workOrderLogService;

    @Autowired
    private SysUserService sysUserService;

    @Transactional
    public WorkOrderEvaluation evaluate(WorkOrderEvaluationDTO dto) {
        Optional<WorkOrderEvaluation> existingEval = evaluationRepository.findByOrderId(dto.getOrderId());
        if (existingEval.isPresent()) {
            throw new IllegalArgumentException("该工单已评价，请勿重复评价");
        }

        WorkOrder order = workOrderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("工单不存在"));

        if (!OrderStatusEnum.COMPLETED.getCode().equals(order.getStatus())) {
            throw new IllegalArgumentException("当前工单状态不允许评价，请等待处理完成");
        }

        if (!order.getReporterId().equals(dto.getReporterId())) {
            throw new IllegalArgumentException("只有上报人才能评价该工单");
        }

        WorkOrderEvaluation evaluation = new WorkOrderEvaluation();
        evaluation.setOrderId(dto.getOrderId());
        evaluation.setReporterId(dto.getReporterId());
        evaluation.setOverallScore(dto.getOverallScore());
        evaluation.setResponseSpeedScore(dto.getResponseSpeedScore());
        evaluation.setProcessQualityScore(dto.getProcessQualityScore());
        evaluation.setServiceAttitudeScore(dto.getServiceAttitudeScore());
        evaluation.setContent(dto.getContent());
        evaluation.setIsSatisfied(dto.getIsSatisfied());
        evaluation = evaluationRepository.save(evaluation);

        String beforeStatus = order.getStatus();
        order.setStatus(OrderStatusEnum.EVALUATED.getCode());
        workOrderRepository.save(order);

        String operatorName = sysUserService.getById(dto.getReporterId()).getRealName();
        workOrderLogService.createLog(
                dto.getOrderId(),
                dto.getReporterId(),
                operatorName,
                OperationTypeEnum.EVALUATE.getCode(),
                beforeStatus,
                OrderStatusEnum.EVALUATED.getCode(),
                "用户评价完成，评分：" + dto.getOverallScore() + "星",
                null
        );

        log.info("工单{}评价完成，总体评分：{}", order.getOrderNo(), dto.getOverallScore());
        return evaluation;
    }

    public WorkOrderEvaluation getByOrderId(Long orderId) {
        return evaluationRepository.findByOrderId(orderId).orElse(null);
    }
}
