package com.cashflow.dto.forecast;

import java.math.BigDecimal;
import java.util.List;

public class ScenarioParams {

    private BigDecimal delayReceivableRate = BigDecimal.ZERO;

    private BigDecimal earlyPayableRate = BigDecimal.ZERO;

    private List<ExtraCashflow> extraInflows;

    private List<ExtraCashflow> extraOutflows;

    public BigDecimal getDelayReceivableRate() {
        return delayReceivableRate;
    }

    public void setDelayReceivableRate(BigDecimal delayReceivableRate) {
        this.delayReceivableRate = delayReceivableRate;
    }

    public BigDecimal getEarlyPayableRate() {
        return earlyPayableRate;
    }

    public void setEarlyPayableRate(BigDecimal earlyPayableRate) {
        this.earlyPayableRate = earlyPayableRate;
    }

    public List<ExtraCashflow> getExtraInflows() {
        return extraInflows;
    }

    public void setExtraInflows(List<ExtraCashflow> extraInflows) {
        this.extraInflows = extraInflows;
    }

    public List<ExtraCashflow> getExtraOutflows() {
        return extraOutflows;
    }

    public void setExtraOutflows(List<ExtraCashflow> extraOutflows) {
        this.extraOutflows = extraOutflows;
    }

    public static class ExtraCashflow {
        private String date;
        private Long amount;
        private String description;

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public Long getAmount() {
            return amount;
        }

        public void setAmount(Long amount) {
            this.amount = amount;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }
}
