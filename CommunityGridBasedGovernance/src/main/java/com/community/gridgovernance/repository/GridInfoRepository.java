package com.community.gridgovernance.repository;

import com.community.gridgovernance.entity.GridInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface GridInfoRepository extends JpaRepository<GridInfo, Long> {
    Optional<GridInfo> findByGridCode(String gridCode);
    List<GridInfo> findByAreaName(String areaName);
    List<GridInfo> findByStatus(Integer status);

    @Query("SELECT g FROM GridInfo g WHERE g.status = 1 " +
           "AND g.lngMin <= :lng AND g.lngMax >= :lng " +
           "AND g.latMin <= :lat AND g.latMax >= :lat")
    List<GridInfo> findGridByLocation(@Param("lng") BigDecimal lng, @Param("lat") BigDecimal lat);
}
