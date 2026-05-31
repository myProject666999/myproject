package com.market.stall.service;

import com.market.stall.dto.StallDTO;
import com.market.stall.vo.StallMapVO;
import com.market.stall.vo.StallVO;

import java.util.List;

public interface StallService {

    List<StallVO> getStallsByEvent(Long eventId);

    StallMapVO getStallMap(Long eventId);

    void createStall(StallDTO dto);

    void batchCreateStalls(List<StallDTO> dtoList);

    void updateStall(Long id, StallDTO dto);

    void deleteStall(Long id);
}
