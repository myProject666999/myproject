package com.restaurant.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "dining_table")
public class DiningTable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "table_no", nullable = false, unique = true, length = 20)
    private String tableNo;

    @Column(nullable = false)
    private Integer seats = 4;

    @Column(nullable = false, length = 20)
    private String status = "IDLE";

    @Column(name = "qr_code")
    private String qrCode;

    private String remark;

    @Column(name = "create_time", nullable = false, updatable = false)
    private LocalDateTime createTime = LocalDateTime.now();

    @Column(name = "update_time", nullable = false)
    private LocalDateTime updateTime = LocalDateTime.now();
}
