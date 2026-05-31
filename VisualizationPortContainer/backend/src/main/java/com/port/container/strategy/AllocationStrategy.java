package com.port.container.strategy;

import com.port.container.dto.SlotAllocationResult;
import com.port.container.entity.Container;
import com.port.container.entity.YardSlot;

import java.io.Serializable;
import java.util.List;

public interface AllocationStrategy extends Serializable {

    SlotAllocationResult allocate(Container container, List<YardSlot> availableSlots);

    String getStrategyName();

    int calculateScore(Container container, YardSlot slot);
}
