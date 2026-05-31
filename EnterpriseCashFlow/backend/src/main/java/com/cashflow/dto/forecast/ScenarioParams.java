package com.cashflow.dto.forecast;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ScenarioParams {

    private BigDecimal delayReceivableRate = BigDecimal.ZERO;

    private BigDecimal earlyPayableRate = BigDecimal.ZERO;

    private List<ExtraCashflow> extraInflows;

    private List<ExtraCashflow> extraOutflows;

    @Data
    public static class ExtraCashflow {
        private String date;
        private Long amount;
        private String description;
    }
}
