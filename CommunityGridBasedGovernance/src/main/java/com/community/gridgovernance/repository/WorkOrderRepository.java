package com.community.gridgovernance.repository;

import com.community.gridgovernance.entity.WorkOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
    List<WorkOrder> findByReporterIdOrderByCreateTimeDesc(Long reporterId);
    List<WorkOrder> findByGridWorkerIdOrderByCreateTimeDesc(Long gridWorkerId);
    List<WorkOrder> findByGridIdOrderByCreateTimeDesc(Long gridId);
    List<WorkOrder> findByStatusOrderByCreateTimeDesc(String status);
    List<WorkOrder> findByStatusInOrderByCreateTimeDesc(List<String> statuses);

    @Query("SELECT w FROM WorkOrder w WHERE w.status IN :statuses " +
           "AND w.expectCompleteTime < :now AND w.isOverdue = 0")
    List<WorkOrder> findOverdueOrders(@Param("statuses") List<String> statuses,
                                       @Param("now") LocalDateTime now);

    @Query("SELECT w.gridId, g.gridName, g.areaName, w.orderType, " +
           "COUNT(w), " +
           "SUM(CASE WHEN w.status = 'PENDING' THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN w.status IN ('ASSIGNED', 'PROCESSING', 'ESCALATED') THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN w.status IN ('COMPLETED', 'EVALUATED', 'CLOSED') THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN w.isOverdue = 1 THEN 1 ELSE 0 END) " +
           "FROM WorkOrder w LEFT JOIN GridInfo g ON w.gridId = g.id " +
           "WHERE DATE(w.createTime) = CURRENT_DATE " +
           "GROUP BY w.gridId, g.gridName, g.areaName, w.orderType")
    List<Object[]> getTodayHotspotData();

    @Query("SELECT w.gridId, g.gridName, g.areaName, w.orderType, " +
           "COUNT(w), " +
           "SUM(CASE WHEN w.status = 'PENDING' THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN w.status IN ('ASSIGNED', 'PROCESSING', 'ESCALATED') THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN w.status IN ('COMPLETED', 'EVALUATED', 'CLOSED') THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN w.isOverdue = 1 THEN 1 ELSE 0 END) " +
           "FROM WorkOrder w LEFT JOIN GridInfo g ON w.gridId = g.id " +
           "GROUP BY w.gridId, g.gridName, g.areaName, w.orderType")
    List<Object[]> getAllTimeHotspotData();
}
