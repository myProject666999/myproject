package com.port.container.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.port.container.dto.SlotQueryDTO;
import com.port.container.entity.YardSlot;
import com.port.container.vo.SlotHeatmapVO;

import java.util.List;

public interface YardSlotService extends IService<YardSlot> {

    YardSlot getById(Long id);

    List<YardSlot> list();

    IPage<YardSlot> page(Long current, Long size);

    boolean save(YardSlot yardSlot);

    boolean update(YardSlot yardSlot);

    boolean remove(Long id);

    List<YardSlot> getAvailableSlots(SlotQueryDTO dto);

    List<YardSlot> getSlotsByYardAndLayer(Long yardId, Integer tierNo);

    List<SlotHeatmapVO> getSlotHeatmapData(Long yardId);

    boolean lockSlot(Long slotId, Long operatorId);

    boolean occupySlot(Long slotId, Long containerId);

    boolean releaseSlot(Long slotId);

    boolean batchUpdateSlotStatus(List<Long> slotIds, Integer status);
}
