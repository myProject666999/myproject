package com.travel.expense.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class DebtMatrixDTO {

    private List<UserDTO> users;
    private List<List<BigDecimal>> matrix;

}
