package com.creator.subscription.scheduled;

import com.creator.subscription.service.EarningService;
import com.creator.subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ScheduledTasks {

    private final SubscriptionService subscriptionService;
    private final EarningService earningService;

    @Scheduled(cron = "0 0 2 * * ?")
    public void processExpiredSubscriptions() {
        log.info("开始处理过期订阅...");
        try {
            subscriptionService.processExpiredSubscriptions();
            log.info("过期订阅处理完成");
        } catch (Exception e) {
            log.error("过期订阅处理失败", e);
        }
    }

    @Scheduled(cron = "0 0 3 * * ?")
    public void processEarningSettlement() {
        log.info("开始处理收益结算...");
        try {
            earningService.processSettlement();
            log.info("收益结算处理完成");
        } catch (Exception e) {
            log.error("收益结算处理失败", e);
        }
    }
}
