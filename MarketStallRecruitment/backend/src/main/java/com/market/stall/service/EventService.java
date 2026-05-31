package com.market.stall.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.market.stall.dto.EventDTO;
import com.market.stall.entity.Event;
import com.market.stall.vo.EventVO;

public interface EventService {

    IPage<EventVO> pageEvents(IPage<Event> page, String keyword, Integer status);

    EventVO getEventDetail(Long id);

    void createEvent(EventDTO dto, Long userId);

    void updateEvent(Long id, EventDTO dto);

    void deleteEvent(Long id);

    void updateEventStatus(Long id, Integer status);
}
