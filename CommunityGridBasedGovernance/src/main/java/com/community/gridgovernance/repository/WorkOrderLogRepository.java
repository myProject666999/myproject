package com.community.gridgovernance.repository;

import com.community.gridgovernance.entity.WorkOrderLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkOrderLogRepository extends JpaRepository<WorkOrderLog, Long> {
    List<WorkOrderLog> findByOrderIdOrderByCreateTimeAsc(Long orderId);
    List<WorkOrderLog> findByOrderIdOrderByCreateTimeDesc(Long orderId);
}
