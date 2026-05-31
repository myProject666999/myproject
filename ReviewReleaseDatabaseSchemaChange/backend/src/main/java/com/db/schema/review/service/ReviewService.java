package com.db.schema.review.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.db.schema.review.common.BusinessException;
import com.db.schema.review.entity.ReviewRecord;
import com.db.schema.review.entity.SchemaOrder;
import com.db.schema.review.mapper.ReviewRecordMapper;
import com.db.schema.review.mapper.SchemaOrderMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class ReviewService {

    @Autowired
    private ReviewRecordMapper reviewRecordMapper;

    @Autowired
    private SchemaOrderMapper orderMapper;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional(rollbackFor = Exception.class)
    public void review(Long orderId, String reviewStatus, String reviewComment, Integer reviewLevel) {
        SchemaOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!"pending_review".equals(order.getStatus()) && !"reviewing".equals(order.getStatus())) {
            throw new BusinessException("只有待评审或评审中的工单可以执行评审");
        }

        ReviewRecord record = new ReviewRecord();
        record.setOrderId(orderId);
        record.setReviewerId(4L);
        record.setReviewerName("reviewer1");
        record.setReviewerRole("reviewer");
        record.setReviewStatus(reviewStatus);
        record.setReviewComment(reviewComment);
        record.setReviewLevel(reviewLevel != null ? reviewLevel : 1);
        record.setReviewTime(LocalDateTime.now());
        reviewRecordMapper.insert(record);

        String oldStatus = order.getStatus();
        if ("approved".equals(reviewStatus)) {
            int requiredLevel = getRequiredReviewLevel(order);
            if (record.getReviewLevel() >= requiredLevel) {
                order.setStatus("pending_execution");
            } else {
                order.setStatus("reviewing");
            }
        } else if ("rejected".equals(reviewStatus)) {
            order.setStatus("rejected");
        } else if ("need_modify".equals(reviewStatus)) {
            order.setStatus("need_modify");
        }
        orderMapper.updateById(order);

        auditLogService.logReviewOperation("review", orderId, order.getTitle(),
                oldStatus, order.getStatus(), "评审结果：" + reviewStatus);
    }

    private int getRequiredReviewLevel(SchemaOrder order) {
        String riskLevel = order.getRiskLevel();
        switch (riskLevel) {
            case "critical":
                return 3;
            case "high":
                return 2;
            case "medium":
            case "low":
            default:
                return 1;
        }
    }

    public List<ReviewRecord> getReviewRecords(Long orderId) {
        return reviewRecordMapper.selectList(
                new LambdaQueryWrapper<ReviewRecord>()
                        .eq(ReviewRecord::getOrderId, orderId)
                        .orderByDesc(ReviewRecord::getReviewTime)
        );
    }

    public List<SchemaOrder> getPendingReviewOrders() {
        return orderMapper.selectList(
                new LambdaQueryWrapper<SchemaOrder>()
                        .in(SchemaOrder::getStatus, "pending_review", "reviewing")
                        .orderByAsc(SchemaOrder::getCreateTime)
        );
    }
}
