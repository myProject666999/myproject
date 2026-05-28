package com.community.gridgovernance.repository;

import com.community.gridgovernance.entity.WorkOrderHotspot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkOrderHotspotRepository extends JpaRepository<WorkOrderHotspot, Long> {
    List<WorkOrderHotspot> findByStatDateOrderByTotalCountDesc(LocalDate statDate);
    List<WorkOrderHotspot> findByStatDateBetweenOrderByTotalCountDesc(LocalDate startDate, LocalDate endDate);
    Optional<WorkOrderHotspot> findByGridIdAndOrderTypeAndStatDate(Long gridId, String orderType, LocalDate statDate);
    List<WorkOrderHotspot> findByAreaNameAndStatDate(String areaName, LocalDate statDate);
}
