package com.port.container.strategy;

import com.port.container.dto.SlotAllocationResult;
import com.port.container.entity.Container;
import com.port.container.entity.YardSlot;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Component("weightBasedStrategy")
public class WeightBasedStrategy implements AllocationStrategy {

    private static final long serialVersionUID = 1L;

    private static final BigDecimal HEAVY_THRESHOLD = new BigDecimal("20");
    private static final BigDecimal LIGHT_THRESHOLD = new BigDecimal("10");

    @Override
    public SlotAllocationResult allocate(Container container, List<YardSlot> availableSlots) {
        log.info("执行重量优先策略分配箱位, 箱号: {}, 重量: {}吨",
                container.getContainerNo(), container.getGrossWeight());

        if (availableSlots == null || availableSlots.isEmpty()) {
            log.warn("没有可用箱位");
            return null;
        }

        availableSlots.sort((s1, s2) -> {
            int score1 = calculateScore(container, s1);
            int score2 = calculateScore(container, s2);
            return Integer.compare(score2, score1);
        });

        YardSlot selectedSlot = availableSlots.get(0);
        int score = calculateScore(container, selectedSlot);

        SlotAllocationResult result = new SlotAllocationResult();
        result.setSelectedSlot(selectedSlot);
        result.setScore(BigDecimal.valueOf(score));
        result.setStrategyName(getStrategyName());
        result.setReason(buildReason(container, selectedSlot));

        log.info("重量优先策略分配完成, 选中箱位: {}, 层号: {}, 得分: {}",
                selectedSlot.getSlotCode(), selectedSlot.getTierNum(), score);
        return result;
    }

    @Override
    public String getStrategyName() {
        return "weight_based";
    }

    @Override
    public int calculateScore(Container container, YardSlot slot) {
        BigDecimal weight = container.getGrossWeight();
        if (weight == null) {
            weight = BigDecimal.ZERO;
        }

        int tierNum = slot.getTierNum() != null ? slot.getTierNum() : 1;

        if (weight.compareTo(HEAVY_THRESHOLD) >= 0) {
            return calculateHeavyScore(tierNum);
        } else if (weight.compareTo(LIGHT_THRESHOLD) < 0) {
            return calculateLightScore(tierNum);
        } else {
            return calculateMediumScore(tierNum);
        }
    }

    private int calculateHeavyScore(int tierNum) {
        if (tierNum <= 2) {
            return 100 - (tierNum - 1) * 5;
        } else {
            return Math.max(50, 90 - (tierNum - 2) * 15);
        }
    }

    private int calculateLightScore(int tierNum) {
        if (tierNum >= 3) {
            return 100 - (tierNum - 3) * 5;
        } else {
            return Math.max(50, 80 - (3 - tierNum) * 15);
        }
    }

    private int calculateMediumScore(int tierNum) {
        if (tierNum >= 2 && tierNum <= 3) {
            return 100;
        } else if (tierNum == 1 || tierNum == 4) {
            return 85;
        } else {
            return Math.max(50, 70 - Math.abs(tierNum - 2) * 10);
        }
    }

    private String buildReason(Container container, YardSlot slot) {
        BigDecimal weight = container.getGrossWeight();
        if (weight == null) {
            weight = BigDecimal.ZERO;
        }

        String weightType;
        if (weight.compareTo(HEAVY_THRESHOLD) >= 0) {
            weightType = "重箱(>=20吨)";
        } else if (weight.compareTo(LIGHT_THRESHOLD) < 0) {
            weightType = "轻箱(<10吨)";
        } else {
            weightType = "中箱(10-20吨)";
        }

        return String.format("%s优先选择%s层，当前层号: %d，重量: %s吨",
                weightType,
                weight.compareTo(HEAVY_THRESHOLD) >= 0 ? "低" : (weight.compareTo(LIGHT_THRESHOLD) < 0 ? "高" : "中"),
                slot.getTierNum(),
                weight);
    }
}
