package com.port.container.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.port.container.dto.AllocationSuggestionDTO;
import com.port.container.entity.AllocationRecord;
import com.port.container.vo.AllocationSuggestionVO;

import java.util.List;

public interface AllocationService extends IService<AllocationRecord> {

    List<AllocationSuggestionVO> suggestSlot(AllocationSuggestionDTO dto);

    boolean confirmAllocation(Long containerId, Long slotId, String strategyName, Long operatorId);

    List<AllocationRecord> getAllocationHistory(Long containerId);

    boolean autoAllocate(Long containerId, Long operatorId);
}
