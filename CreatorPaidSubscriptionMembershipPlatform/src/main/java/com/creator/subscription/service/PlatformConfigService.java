package com.creator.subscription.service;

import com.creator.subscription.entity.PlatformConfig;
import com.creator.subscription.repository.PlatformConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PlatformConfigService {

    private final PlatformConfigRepository platformConfigRepository;

    public BigDecimal getFeeRate() {
        PlatformConfig config = platformConfigRepository.findByConfigKey("platform.fee.rate")
                .orElse(null);
        if (config == null) {
            return new BigDecimal("10");
        }
        return new BigDecimal(config.getConfigValue());
    }

    public int getSettlementDays() {
        PlatformConfig config = platformConfigRepository.findByConfigKey("platform.settlement.days")
                .orElse(null);
        if (config == null) {
            return 7;
        }
        return Integer.parseInt(config.getConfigValue());
    }

    public long getMinWithdrawalAmount() {
        PlatformConfig config = platformConfigRepository.findByConfigKey("platform.min.withdrawal")
                .orElse(null);
        if (config == null) {
            return 10000;
        }
        return Long.parseLong(config.getConfigValue());
    }

    public String getConfigValue(String key) {
        return platformConfigRepository.findByConfigKey(key)
                .map(PlatformConfig::getConfigValue)
                .orElse(null);
    }
}
