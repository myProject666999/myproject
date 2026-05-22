package com.medication.vo;

import lombok.Data;
import java.time.LocalDate;

@Data
public class InventoryVO {
    private Long id;
    private Long userId;
    private String userName;
    private Long medicineId;
    private String medicineName;
    private String specification;
    private Integer quantity;
    private String unit;
    private Integer warningQuantity;
    private LocalDate expiryDate;
    private String batchNo;
    private Boolean lowStock;
}
