package com.recycling.dto;

import lombok.Data;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

@Data
public class EstimateRequestDTO {
    @NotNull(message = "品类ID不能为空")
    private Long categoryId;
    
    private BigDecimal quantity;
    
    private List<FactorAnswer> factorAnswers;
    
    @Data
    public static class FactorAnswer {
        private Long factorId;
        private String selectedOption;
        private BigDecimal numberValue;
    }
}
