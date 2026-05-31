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
@Component("nearestExitStrategy")
public class NearestExitStrategy implements AllocationStrategy {

    private static final long serialVersionUID = 1L;

    @Override
    public SlotAllocationResult allocate(Container container, List<YardSlot> availableSlots) {
        log.info("执行靠近出口策略分配箱位, 箱号: {}", container.getContainerNo());

        if (availableSlots == null || availableSlots.isEmpty()) {
            log.warn("没有可用箱位");
            return null;
        }

        availableSlots.sort(Comparator.comparing(YardSlot::getBayNum));

        YardSlot selectedSlot = availableSlots.get(0);
        int maxBay = availableSlots.stream()
                .mapToInt(YardSlot::getBayNum)
                .max()
                .orElse(1);
        int score = calculateScoreWithMaxBay(selectedSlot, maxBay);

        SlotAllocationResult result = new SlotAllocationResult();
        result.setSelectedSlot(selectedSlot);
        result.setScore(BigDecimal.valueOf(score));
        result.setStrategyName(getStrategyName());
        result.setReason("优先选择bayNum小（靠近出口）的箱位，bayNum: " + selectedSlot.getBayNum());

        log.info("靠近出口策略分配完成, 选中箱位: {}, bayNum: {}, 得分: {}",
                selectedSlot.getSlotCode(), selectedSlot.getBayNum(), score);
        return result;
    }

    @Override
    public String getStrategyName() {
        return "nearest_exit";
    }

    @Override
    public int calculateScore(Container container, YardSlot slot) {
        return calculateScoreWithMaxBay(slot, 100);
    }

    private int calculateScoreWithMaxBay(YardSlot slot, int maxBay) {
        if (maxBay <= 0) {
            maxBay = 1;
        }
        double score = 100 - ((double) slot.getBayNum() / maxBay) * 50;
        return (int) Math.max(50, Math.min(100, score));
    }
}
