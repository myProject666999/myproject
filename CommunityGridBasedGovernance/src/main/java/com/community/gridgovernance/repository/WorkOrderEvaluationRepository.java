package com.community.gridgovernance.repository;

import com.community.gridgovernance.entity.WorkOrderEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkOrderEvaluationRepository extends JpaRepository<WorkOrderEvaluation, Long> {
    Optional<WorkOrderEvaluation> findByOrderId(Long orderId);
}
