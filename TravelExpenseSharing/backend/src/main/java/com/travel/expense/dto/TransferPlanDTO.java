package com.travel.expense.dto;

import lombok.Data;
import java.util.List;

@Data
public class TransferPlanDTO {

    private Integer totalTransfers;
    private List<TransferDTO> transfers;

}
