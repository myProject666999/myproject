package com.port.container.strategy;

import com.port.container.entity.AllocationRecord;
import com.port.container.entity.Container;
import com.port.container.entity.YardSlot;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
public class RehandleCalculator implements Serializable {

    private static final long serialVersionUID = 1L;

    public int calculateEstimatedRehandles(YardSlot targetSlot, List<YardSlot> allSlots) {
        log.debug("计算目标箱位 {} 的预计翻箱次数", targetSlot.getSlotCode());

        if (targetSlot == null || allSlots == null || allSlots.isEmpty()) {
            return 0;
        }

        int estimatedRehandles = 0;

        Integer targetTier = targetSlot.getTierNum();
        Integer targetRow = targetSlot.getRowNum();
        Integer targetBay = targetSlot.getBayNum();
        Long targetYardId = targetSlot.getYardId();

        if (targetTier == null || targetRow == null || targetBay == null) {
            return 0;
        }

        for (YardSlot slot : allSlots) {
            if (slot.getId() != null && slot.getId().equals(targetSlot.getId())) {
                continue;
            }

            if (!targetYardId.equals(slot.getYardId())) {
                continue;
            }

            Integer slotTier = slot.getTierNum();
            Integer slotRow = slot.getRowNum();
            Integer slotBay = slot.getBayNum();
            Integer slotStatus = slot.getStatus();
            Long currentContainerId = slot.getCurrentContainerId();

            if (slotTier == null || slotRow == null || slotBay == null) {
                continue;
            }

            boolean isSameStack = slotRow.equals(targetRow) && slotBay.equals(targetBay);
            boolean isAbove = slotTier > targetTier;
            boolean isOccupied = slotStatus != null && slotStatus != 0 && currentContainerId != null;

            if (isSameStack && isAbove && isOccupied) {
                estimatedRehandles++;
            }
        }

        log.debug("箱位 {} 预计翻箱次数: {}", targetSlot.getSlotCode(), estimatedRehandles);
        return estimatedRehandles;
    }

    public double calculateRehandleRate(List<Container> containers, List<AllocationRecord> records) {
        log.info("计算历史翻箱率, 容器数量: {}, 分配记录数量: {}",
                containers != null ? containers.size() : 0,
                records != null ? records.size() : 0);

        if (containers == null || containers.isEmpty() || records == null || records.isEmpty()) {
            return 0.0;
        }

        int totalContainers = containers.size();
        int rehandleCount = 0;

        for (AllocationRecord record : records) {
            String reason = record.getReason();
            if (reason != null && (reason.contains("翻箱") || reason.contains("倒箱") || reason.contains("rehandle"))) {
                rehandleCount++;
            }

            Integer status = record.getStatus();
            if (status != null && status == 3) {
                rehandleCount++;
            }
        }

        double rehandleRate = totalContainers > 0 ? (double) rehandleCount / totalContainers : 0.0;

        log.info("历史翻箱率计算完成: {}/{} = {:.2f}%", rehandleCount, totalContainers, rehandleRate * 100);
        return rehandleRate;
    }

    public double calculateRehandlePenalty(int estimatedRehandles) {
        if (estimatedRehandles <= 0) {
            return 0.0;
        }

        double basePenalty = 10.0;
        double incrementalPenalty = 5.0;

        return basePenalty + (estimatedRehandles - 1) * incrementalPenalty;
    }

    public boolean isRehandleNeeded(Container container, YardSlot targetSlot, List<YardSlot> allSlots, List<Container> containers) {
        if (container == null || targetSlot == null || allSlots == null) {
            return false;
        }

        LocalDateTime containerOutTime = container.getOutTime();
        if (containerOutTime == null) {
            return false;
        }

        Integer targetTier = targetSlot.getTierNum();
        Integer targetRow = targetSlot.getRowNum();
        Integer targetBay = targetSlot.getBayNum();
        Long targetYardId = targetSlot.getYardId();

        if (targetTier == null || targetRow == null || targetBay == null) {
            return false;
        }

        for (YardSlot slot : allSlots) {
            if (!targetYardId.equals(slot.getYardId())) {
                continue;
            }

            Integer slotTier = slot.getTierNum();
            Integer slotRow = slot.getRowNum();
            Integer slotBay = slot.getBayNum();
            Integer slotStatus = slot.getStatus();
            Long currentContainerId = slot.getCurrentContainerId();

            if (slotTier == null || slotRow == null || slotBay == null) {
                continue;
            }

            boolean isSameStack = slotRow.equals(targetRow) && slotBay.equals(targetBay);
            boolean isBelow = slotTier < targetTier;
            boolean isOccupied = slotStatus != null && slotStatus != 0 && currentContainerId != null;

            if (isSameStack && isBelow && isOccupied) {
                Container belowContainer = findContainerById(containers, currentContainerId);
                if (belowContainer != null && belowContainer.getOutTime() != null) {
                    Duration duration = Duration.between(containerOutTime, belowContainer.getOutTime());
                    if (duration.toDays() > 0) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private Container findContainerById(List<Container> containers, Long containerId) {
        if (containers == null || containerId == null) {
            return null;
        }
        for (Container container : containers) {
            if (containerId.equals(container.getId())) {
                return container;
            }
        }
        return null;
    }
}
