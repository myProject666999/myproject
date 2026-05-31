package com.market.stall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.market.stall.dto.EventDTO;
import com.market.stall.entity.Event;
import com.market.stall.entity.Registration;
import com.market.stall.entity.Stall;
import com.market.stall.exception.BusinessException;
import com.market.stall.mapper.EventMapper;
import com.market.stall.mapper.RegistrationMapper;
import com.market.stall.mapper.StallMapper;
import com.market.stall.service.EventService;
import com.market.stall.vo.EventVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventMapper eventMapper;
    private final RegistrationMapper registrationMapper;
    private final StallMapper stallMapper;

    @Override
    public IPage<EventVO> pageEvents(IPage<Event> page, String keyword, Integer status) {
        LambdaQueryWrapper<Event> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(Event::getTitle, keyword);
        }
        if (status != null) {
            wrapper.eq(Event::getStatus, status);
        }
        wrapper.orderByDesc(Event::getCreateTime);
        IPage<Event> eventPage = eventMapper.selectPage(page, wrapper);
        return eventPage.convert(this::toEventVO);
    }

    @Override
    public EventVO getEventDetail(Long id) {
        Event event = eventMapper.selectById(id);
        if (event == null) {
            throw new BusinessException("活动不存在");
        }
        return toEventVO(event);
    }

    @Override
    public void createEvent(EventDTO dto, Long userId) {
        Event event = new Event();
        BeanUtils.copyProperties(dto, event);
        event.setCreateBy(userId);
        event.setStatus(0);
        eventMapper.insert(event);
    }

    @Override
    public void updateEvent(Long id, EventDTO dto) {
        Event event = eventMapper.selectById(id);
        if (event == null) {
            throw new BusinessException("活动不存在");
        }
        BeanUtils.copyProperties(dto, event);
        event.setId(id);
        eventMapper.updateById(event);
    }

    @Override
    public void deleteEvent(Long id) {
        Event event = eventMapper.selectById(id);
        if (event == null) {
            throw new BusinessException("活动不存在");
        }
        eventMapper.deleteById(id);
    }

    @Override
    public void updateEventStatus(Long id, Integer status) {
        Event event = eventMapper.selectById(id);
        if (event == null) {
            throw new BusinessException("活动不存在");
        }
        event.setStatus(status);
        eventMapper.updateById(event);
    }

    private EventVO toEventVO(Event event) {
        EventVO vo = new EventVO();
        BeanUtils.copyProperties(event, vo);
        Long registrationCount = registrationMapper.selectCount(
                new LambdaQueryWrapper<Registration>().eq(Registration::getEventId, event.getId())
        );
        vo.setCurrentRegistrationCount(registrationCount.intValue());
        Long totalStallCount = stallMapper.selectCount(
                new LambdaQueryWrapper<Stall>().eq(Stall::getEventId, event.getId())
        );
        vo.setTotalStallCount(totalStallCount.intValue());
        Long availableStallCount = stallMapper.selectCount(
                new LambdaQueryWrapper<Stall>()
                        .eq(Stall::getEventId, event.getId())
                        .eq(Stall::getStatus, 0)
        );
        vo.setAvailableStallCount(availableStallCount.intValue());
        return vo;
    }
}
