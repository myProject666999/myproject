package com.port.container.strategy;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class AllocationStrategyFactory implements Serializable {

    private static final long serialVersionUID = 1L;

    private final Map<String, AllocationStrategy> strategyMap = new ConcurrentHashMap<>();

    private final List<AllocationStrategy> strategies = new ArrayList<>();

    @Autowired
    public AllocationStrategyFactory(List<AllocationStrategy> strategyList) {
        if (strategyList != null) {
            this.strategies.addAll(strategyList);
            for (AllocationStrategy strategy : strategyList) {
                String strategyName = strategy.getStrategyName();
                strategyMap.put(strategyName, strategy);
                log.info("注册箱位分配策略: {}", strategyName);
            }
        }
        log.info("箱位分配策略工厂初始化完成，共注册 {} 个策略", strategyMap.size());
    }

    public AllocationStrategy getStrategy(String strategyName) {
        if (strategyName == null || strategyName.trim().isEmpty()) {
            log.warn("策略名称为空，返回默认策略");
            return getDefaultStrategy();
        }

        AllocationStrategy strategy = strategyMap.get(strategyName.trim());
        if (strategy == null) {
            log.warn("未找到策略: {}，返回默认策略", strategyName);
            return getDefaultStrategy();
        }

        return strategy;
    }

    public List<AllocationStrategy> getAllStrategies() {
        return new ArrayList<>(strategies);
    }

    public List<String> getAllStrategyNames() {
        return new ArrayList<>(strategyMap.keySet());
    }

    public AllocationStrategy getDefaultStrategy() {
        AllocationStrategy defaultStrategy = strategyMap.get("score_based");
        if (defaultStrategy == null && !strategies.isEmpty()) {
            defaultStrategy = strategies.get(0);
        }
        return defaultStrategy;
    }

    public boolean containsStrategy(String strategyName) {
        if (strategyName == null) {
            return false;
        }
        return strategyMap.containsKey(strategyName.trim());
    }

    public int getStrategyCount() {
        return strategyMap.size();
    }

    public void registerStrategy(AllocationStrategy strategy) {
        if (strategy == null) {
            log.warn("尝试注册空策略，忽略");
            return;
        }

        String strategyName = strategy.getStrategyName();
        if (strategyName == null || strategyName.trim().isEmpty()) {
            log.warn("策略名称为空，无法注册");
            return;
        }

        if (strategyMap.containsKey(strategyName)) {
            log.warn("策略已存在，将被覆盖: {}", strategyName);
        }

        strategyMap.put(strategyName, strategy);
        if (!strategies.contains(strategy)) {
            strategies.add(strategy);
        }

        log.info("策略注册成功: {}", strategyName);
    }

    public void unregisterStrategy(String strategyName) {
        if (strategyName == null || strategyName.trim().isEmpty()) {
            log.warn("策略名称为空，无法注销");
            return;
        }

        AllocationStrategy removed = strategyMap.remove(strategyName.trim());
        if (removed != null) {
            strategies.remove(removed);
            log.info("策略注销成功: {}", strategyName);
        } else {
            log.warn("未找到要注销的策略: {}", strategyName);
        }
    }
}
