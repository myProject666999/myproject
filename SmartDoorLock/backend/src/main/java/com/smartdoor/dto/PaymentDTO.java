package com.smartdoor.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

public class PaymentDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long billId;
    private BigDecimal amount;
    private String paymentMethod;
    private String paymentTransactionNo;
    private String remark;

    public Long getBillId() {
        return billId;
    }

    public void setBillId(Long billId) {
        this.billId = billId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentTransactionNo() {
        return paymentTransactionNo;
    }

    public void setPaymentTransactionNo(String paymentTransactionNo) {
        this.paymentTransactionNo = paymentTransactionNo;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PaymentDTO that = (PaymentDTO) o;
        return Objects.equals(billId, that.billId) &&
                Objects.equals(amount, that.amount) &&
                Objects.equals(paymentMethod, that.paymentMethod) &&
                Objects.equals(paymentTransactionNo, that.paymentTransactionNo) &&
                Objects.equals(remark, that.remark);
    }

    @Override
    public int hashCode() {
        return Objects.hash(billId, amount, paymentMethod, paymentTransactionNo, remark);
    }

    @Override
    public String toString() {
        return "PaymentDTO{" +
                "billId=" + billId +
                ", amount=" + amount +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", paymentTransactionNo='" + paymentTransactionNo + '\'' +
                ", remark='" + remark + '\'' +
                '}';
    }
}
