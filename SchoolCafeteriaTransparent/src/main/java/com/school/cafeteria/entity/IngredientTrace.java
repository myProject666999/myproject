package com.school.cafeteria.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "ingredient_trace")
public class IngredientTrace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "batch_no", nullable = false, unique = true, length = 50)
    private String batchNo;

    @Column(name = "ingredient_name", nullable = false, length = 100)
    private String ingredientName;

    @Column(name = "supplier_id", nullable = false)
    private Long supplierId;

    @Transient
    private String supplierName;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(length = 20)
    private String unit;

    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    @Column(name = "production_date")
    private LocalDate productionDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "quality_certificate", length = 255)
    private String qualityCertificate;

    @Column(name = "inspection_result", length = 20)
    private String inspectionResult;

    @Column(length = 50)
    private String inspector;

    @Column(columnDefinition = "TEXT")
    private String remark;

    @Column(name = "create_by")
    private Long createBy;

    @CreationTimestamp
    @Column(name = "create_time")
    private LocalDateTime createTime;

    @UpdateTimestamp
    @Column(name = "update_time")
    private LocalDateTime updateTime;
}
