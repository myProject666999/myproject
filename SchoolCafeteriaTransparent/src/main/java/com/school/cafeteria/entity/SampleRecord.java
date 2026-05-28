package com.school.cafeteria.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "sample_record")
public class SampleRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sample_no", nullable = false, unique = true, length = 50)
    private String sampleNo;

    @Column(name = "menu_id")
    private Long menuId;

    @Column(name = "dish_name", nullable = false, length = 100)
    private String dishName;

    @Column(name = "sample_date", nullable = false)
    private LocalDate sampleDate;

    @Column(name = "sample_time", nullable = false)
    private LocalTime sampleTime;

    @Column(name = "sample_weight", precision = 10, scale = 2)
    private BigDecimal sampleWeight;

    @Column(name = "storage_location", length = 100)
    private String storageLocation;

    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl;

    @Column(nullable = false, length = 50)
    private String sampler;

    @Column(columnDefinition = "TEXT")
    private String remark;

    @Column(name = "disposal_time")
    private LocalDateTime disposalTime;

    @Column(name = "disposal_person", length = 50)
    private String disposalPerson;

    @Column(name = "disposal_image", length = 255)
    private String disposalImage;

    @CreationTimestamp
    @Column(name = "create_time")
    private LocalDateTime createTime;

    @UpdateTimestamp
    @Column(name = "update_time")
    private LocalDateTime updateTime;
}
