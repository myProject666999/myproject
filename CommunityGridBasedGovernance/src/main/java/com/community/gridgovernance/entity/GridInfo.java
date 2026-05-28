package com.community.gridgovernance.entity;

import lombok.Data;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "grid_info")
public class GridInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "grid_code", nullable = false, length = 50)
    private String gridCode;

    @Column(name = "grid_name", nullable = false, length = 100)
    private String gridName;

    @Column(name = "area_name", nullable = false, length = 100)
    private String areaName;

    @Column(name = "lng_min", nullable = false, precision = 11, scale = 8)
    private BigDecimal lngMin;

    @Column(name = "lng_max", nullable = false, precision = 11, scale = 8)
    private BigDecimal lngMax;

    @Column(name = "lat_min", nullable = false, precision = 10, scale = 8)
    private BigDecimal latMin;

    @Column(name = "lat_max", nullable = false, precision = 10, scale = 8)
    private BigDecimal latMax;

    @Column(name = "center_lng", nullable = false, precision = 11, scale = 8)
    private BigDecimal centerLng;

    @Column(name = "center_lat", nullable = false, precision = 10, scale = 8)
    private BigDecimal centerLat;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "status", nullable = false)
    private Integer status;

    @Column(name = "create_time", nullable = false, updatable = false)
    private LocalDateTime createTime;

    @Column(name = "update_time", nullable = false)
    private LocalDateTime updateTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        updateTime = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updateTime = LocalDateTime.now();
    }
}
