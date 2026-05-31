package com.port.container.strategy;

import com.port.container.dto.SlotAllocationResult;
import com.port.container.entity.Container;
import com.port.container.entity.YardSlot;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
public class AllocationContext implements Serializable {

    private static final long serialVersionUID = 1L;

    @Setter
    @Getter
    private transient AllocationStrategy currentStrategy;

    @Autowired
    private transient AllocationStrategyFactory strategyFactory;

    public AllocationContext() {
    }

    public void setStrategy(AllocationStrategy strategy) {
        log.info("切换分配策略为: {}", strategy != null ? strategy.getStrategyName() : "null");
        this.currentStrategy = strategy;
    }

    public boolean setStrategyByName(String strategyName) {
        if (strategyFactory == null) {
            log.warn("策略工厂未初始化，无法切换策略");
            return false;
        }

        AllocationStrategy strategy = strategyFactory.getStrategy(strategyName);
        if (strategy == null) {
            log.warn("未找到策略: {}", strategyName);
            return false;
        }

        setStrategy(strategy);
        return true;
    }

    public SlotAllocationResult executeAllocation(Container container, List<YardSlot> availableSlots) {
        log.info("执行箱位分配, 箱号: {}, 可用箱位数: {}, 当前策略: {}",
                container != null ? container.getContainerNo() : "null",
                availableSlots != null ? availableSlots.size() : 0,
                currentStrategy != null ? currentStrategy.getStrategyName() : "null");

        if (currentStrategy == null) {
            log.warn("未设置分配策略，使用默认综合评分策略");
            if (strategyFactory != null) {
                currentStrategy = strategyFactory.getStrategy("score_based");
            }
            if (currentStrategy == null) {
                log.error("无法获取默认策略，分配失败");
                return null;
            }
        }

        if (container == null) {
            log.warn("容器为空，分配失败");
            return null;
        }

        if (availableSlots == null || availableSlots.isEmpty()) {
            log.warn("没有可用箱位，分配失败");
            return null;
        }

        List<YardSlot> validSlots = availableSlots.stream()
                .filter(slot -> slot != null && slot.getStatus() != null && slot.getStatus() == 0)
                .collect(Collectors.toList());

        if (validSlots.isEmpty()) {
            log.warn("没有空闲箱位，分配失败");
            return null;
        }

        SlotAllocationResult result = currentStrategy.allocate(container, validSlots);

        if (result != null) {
            log.info("箱位分配成功, 箱号: {}, 选中箱位: {}, 得分: {}, 策略: {}",
                    container.getContainerNo(),
                    result.getSelectedSlot() != null ? result.getSelectedSlot().getSlotCode() : "null",
                    result.getScore(),
                    result.getStrategyName());
        } else {
            log.warn("箱位分配失败, 箱号: {}", container.getContainerNo());
        }

        return result;
    }

    public List<SlotAllocationResult> executeAllocationWithTopN(Container container, List<YardSlot> availableSlots, int topN) {
        log.info("执行Top-N箱位分配, 箱号: {}, 可用箱位数: {}, TopN: {}, 当前策略: {}",
                container != null ? container.getContainerNo() : "null",
                availableSlots != null ? availableSlots.size() : 0,
                topN,
                currentStrategy != null ? currentStrategy.getStrategyName() : "null");

        if (topN <= 0) {
            topN = 5;
        }

        if (currentStrategy == null) {
            log.warn("未设置分配策略，使用默认综合评分策略");
            if (strategyFactory != null) {
                currentStrategy = strategyFactory.getStrategy("score_based");
            }
            if (currentStrategy == null) {
                log.error("无法获取默认策略，分配失败");
                return new ArrayList<>();
            }
        }

        if (container == null) {
            log.warn("容器为空，分配失败");
            return new ArrayList<>();
        }

        if (availableSlots == null || availableSlots.isEmpty()) {
            log.warn("没有可用箱位，分配失败");
            return new ArrayList<>();
        }

        List<YardSlot> validSlots = availableSlots.stream()
                .filter(slot -> slot != null && slot.getStatus() != null && slot.getStatus() == 0)
                .collect(Collectors.toList());

        if (validSlots.isEmpty()) {
            log.warn("没有空闲箱位，分配失败");
            return new ArrayList<>();
        }

        List<SlotAllocationResult> allResults = new ArrayList<>();
        for (YardSlot slot : validSlots) {
            int score = currentStrategy.calculateScore(container, slot);
            SlotAllocationResult result = new SlotAllocationResult();
            result.setSelectedSlot(slot);
            result.setScore(BigDecimal.valueOf(score));
            result.setStrategyName(currentStrategy.getStrategyName());
            allResults.add(result);
        }

        allResults.sort(Comparator.comparing(SlotAllocationResult::getScore).reversed());

        List<SlotAllocationResult> topResults = allResults.stream()
                .limit(topN)
                .collect(Collectors.toList());

        log.info("Top-N箱位分配完成, 返回 {} 个推荐箱位", topResults.size());
        for (int i = 0; i < topResults.size(); i++) {
            SlotAllocationResult r = topResults.get(i);
            log.debug("第{}名: 箱位={}, 得分={}", i + 1,
                    r.getSelectedSlot() != null ? r.getSelectedSlot().getSlotCode() : "null",
                    r.getScore());
        }

        return topResults;
    }

    public SlotAllocationResult executeAllocationWithStrategy(Container container, List<YardSlot> availableSlots, String strategyName) {
        AllocationStrategy originalStrategy = this.currentStrategy;
        try {
            if (strategyFactory != null) {
                AllocationStrategy strategy = strategyFactory.getStrategy(strategyName);
                if (strategy != null) {
                    this.currentStrategy = strategy;
                }
            }
            return executeAllocation(container, availableSlots);
        } finally {
            this.currentStrategy = originalStrategy;
        }
    }

    public List<SlotAllocationResult> executeAllStrategies(Container container, List<YardSlot> availableSlots) {
        log.info("使用所有策略执行箱位分配, 箱号: {}", container != null ? container.getContainerNo() : "null");

        List<SlotAllocationResult> results = new ArrayList<>();

        if (strategyFactory == null) {
            log.warn("策略工厂未初始化");
            return results;
        }

        List<AllocationStrategy> strategies = strategyFactory.getAllStrategies();
        for (AllocationStrategy strategy : strategies) {
            try {
                this.currentStrategy = strategy;
                SlotAllocationResult result = executeAllocation(container, availableSlots);
                if (result != null) {
                    results.add(result);
                }
            } catch (Exception e) {
                log.error("策略 {} 执行失败: {}", strategy.getStrategyName(), e.getMessage());
            }
        }

        results.sort(Comparator.comparing(SlotAllocationResult::getScore).reversed());

        log.info("所有策略执行完成, 共返回 {} 个结果", results.size());
        return results;
    }
}
