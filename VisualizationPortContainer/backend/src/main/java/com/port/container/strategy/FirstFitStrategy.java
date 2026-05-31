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
@Component("firstFitStrategy")
public class FirstFitStrategy implements AllocationStrategy {

    private static final long serialVersionUID = 1L;

    @Override
    public SlotAllocationResult allocate(Container container, List<YardSlot> availableSlots) {
        log.info("执行最先适配策略分配箱位, 箱号: {}", container.getContainerNo());

        if (availableSlots == null || availableSlots.isEmpty()) {
            log.warn("没有可用箱位");
            return null;
        }

        availableSlots.sort(Comparator.comparing(YardSlot::getSlotCode));

        YardSlot selectedSlot = availableSlots.get(0);
        int score = calculateScore(container, selectedSlot);

        SlotAllocationResult result = new SlotAllocationResult();
        result.setSelectedSlot(selectedSlot);
        result.setScore(BigDecimal.valueOf(score));
        result.setStrategyName(getStrategyName());
        result.setReason("按箱位编码自然排序，选择第一个可用箱位");

        log.info("最先适配策略分配完成, 选中箱位: {}, 得分: {}", selectedSlot.getSlotCode(), score);
        return result;
    }

    @Override
    public String getStrategyName() {
        return "first_fit";
    }

    @Override
    public int calculateScore(Container container, YardSlot slot) {
        return 100;
    }
}
