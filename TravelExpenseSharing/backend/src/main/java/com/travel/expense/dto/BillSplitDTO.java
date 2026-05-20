package com.travel.expense.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BillSplitDTO {

    private Long id;
    private Long participantId;
    private String participantName;
    private BigDecimal splitRatio;
    private BigDecimal splitAmount;

}
