package com.port.container.strategy;

import com.port.container.dto.SlotAllocationResult;
import com.port.container.entity.Container;
import com.port.container.entity.YardSlot;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component("scoreBasedStrategy")
public class ScoreBasedStrategy implements AllocationStrategy {

    private static final long serialVersionUID = 1L;

    @Autowired
    private transient RehandleCalculator rehandleCalculator;

    @Override
    public SlotAllocationResult allocate(Container container, List<YardSlot> availableSlots) {
        log.info("执行综合评分策略分配箱位, 箱号: {}", container.getContainerNo());

        if (availableSlots == null || availableSlots.isEmpty()) {
            log.warn("没有可用箱位");
            return null;
        }

        List<SlotAllocationResult> scoredResults = availableSlots.stream()
                .map(slot -> {
                    int score = calculateScore(container, slot);
                    SlotAllocationResult result = new SlotAllocationResult();
                    result.setSelectedSlot(slot);
                    result.setScore(BigDecimal.valueOf(score));
                    result.setStrategyName(getStrategyName());
                    if (rehandleCalculator != null) {
                        result.setEstimatedRehandles(rehandleCalculator.calculateEstimatedRehandles(slot, availableSlots));
                    }
                    return result;
                })
                .sorted(Comparator.comparing(SlotAllocationResult::getScore).reversed())
                .collect(Collectors.toList());

        SlotAllocationResult bestResult = scoredResults.get(0);
        bestResult.setReason(buildDetailedReason(container, bestResult.getSelectedSlot(), bestResult.getScore().intValue()));

        log.info("综合评分策略分配完成, 选中箱位: {}, 总得分: {}",
                bestResult.getSelectedSlot().getSlotCode(), bestResult.getScore());
        return bestResult;
    }

    @Override
    public String getStrategyName() {
        return "score_based";
    }

    @Override
    public int calculateScore(Container container, YardSlot slot) {
        int totalScore = 0;

        totalScore += calculateMatchScore(container, slot);
        totalScore += calculateLocationScore(container, slot);
        totalScore += calculateStabilityScore(container, slot);
        totalScore += calculateRehandleAvoidanceScore(container, slot);

        return Math.min(100, Math.max(0, totalScore));
    }

    private int calculateMatchScore(Container container, YardSlot slot) {
        int score = 0;

        String containerSize = container.getContainerSize();
        String slotContainerType = slot.getContainerType();
        if (containerSize != null && slotContainerType != null &&
            (slotContainerType.contains(containerSize) || containerSize.contains(slotContainerType))) {
            score += 15;
        }

        String containerType = container.getContainerType();
        if (containerType != null && slotContainerType != null &&
            containerType.equals(slotContainerType)) {
            score += 10;
        }

        if (containerType != null && slotContainerType != null) {
            if ((containerType.contains("R") || containerType.contains("冷藏")) &&
                (slotContainerType.contains("R") || slotContainerType.contains("冷藏"))) {
                score += 5;
            }
        }

        return Math.min(30, score);
    }

    private int calculateLocationScore(Container container, YardSlot slot) {
        int score = 0;

        Integer bayNum = slot.getBayNum();
        if (bayNum != null) {
            score += Math.max(0, 15 - bayNum);
        }

        return Math.min(25, score);
    }

    private int calculateStabilityScore(Container container, YardSlot slot) {
        int score = 0;

        BigDecimal weight = container.getGrossWeight();
        BigDecimal maxWeight = slot.getMaxWeight();
        Integer tierNum = slot.getTierNum();

        if (weight != null && maxWeight != null && tierNum != null) {
            int weightRatio = weight.multiply(new BigDecimal("100")).divide(maxWeight, 0, BigDecimal.ROUND_HALF_UP).intValue();

            if (weightRatio >= 80 && tierNum <= 2) {
                score += 15;
            } else if (weightRatio >= 50 && tierNum <= 3) {
                score += 10;
            } else if (weightRatio < 50 && tierNum >= 2) {
                score += 10;
            } else {
                score += 5;
            }
        }

        if (tierNum != null && tierNum > 1) {
            score += 10;
        }

        return Math.min(25, score);
    }

    private int calculateRehandleAvoidanceScore(Container container, YardSlot slot) {
        int score = 0;

        LocalDateTime outTime = container.getOutTime();
        Integer tierNum = slot.getTierNum();

        if (outTime != null && tierNum != null) {
            LocalDateTime now = LocalDateTime.now();
            long daysUntilOut = java.time.Duration.between(now, outTime).toDays();

            if (daysUntilOut <= 3 && tierNum >= 3) {
                score += 10;
            } else if (daysUntilOut <= 7 && tierNum >= 2) {
                score += 7;
            } else if (daysUntilOut > 7 && tierNum <= 2) {
                score += 5;
            } else {
                score += 3;
            }
        }

        Integer rowNum = slot.getRowNum();
        if (rowNum != null) {
            score += Math.max(0, 10 - Math.abs(rowNum - 5));
        }

        return Math.min(20, score);
    }

    private String buildDetailedReason(Container container, YardSlot slot, int totalScore) {
        StringBuilder sb = new StringBuilder();
        sb.append("综合评分: ").append(totalScore).append("分。");
        sb.append("匹配度(").append(calculateMatchScore(container, slot)).append("分)，");
        sb.append("位置(").append(calculateLocationScore(container, slot)).append("分)，");
        sb.append("稳定性(").append(calculateStabilityScore(container, slot)).append("分)，");
        sb.append("翻箱规避(").append(calculateRehandleAvoidanceScore(container, slot)).append("分)。");
        sb.append("箱位: ").append(slot.getSlotCode());
        sb.append(", 箱型: ").append(slot.getContainerType());
        sb.append(", 位置(排/贝/层): ").append(slot.getRowNum()).append("/").append(slot.getBayNum()).append("/").append(slot.getTierNum());
        return sb.toString();
    }
}
