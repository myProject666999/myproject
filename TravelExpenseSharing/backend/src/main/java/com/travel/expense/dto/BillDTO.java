package com.travel.expense.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class BillDTO {

    private Long id;
    private String title;
    private BigDecimal amount;
    private Long payerId;
    private String payerName;
    private LocalDate billDate;
    private String remark;
    private List<BillSplitDTO> splits;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
