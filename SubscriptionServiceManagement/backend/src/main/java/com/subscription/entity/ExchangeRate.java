package com.subscription.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "exchange_rates")
public class ExchangeRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "currency_from", nullable = false, length = 10)
    private String currencyFrom;

    @Column(name = "currency_to", nullable = false, length = 10)
    private String currencyTo = "CNY";

    @Column(nullable = false, precision = 15, scale = 6)
    private BigDecimal rate;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
