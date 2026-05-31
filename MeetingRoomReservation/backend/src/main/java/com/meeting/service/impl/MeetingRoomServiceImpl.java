package com.meeting.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.meeting.entity.MeetingRoom;
import com.meeting.mapper.MeetingRoomMapper;
import com.meeting.service.MeetingRoomService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MeetingRoomServiceImpl extends ServiceImpl<MeetingRoomMapper, MeetingRoom>
        implements MeetingRoomService {

    @Override
    public List<MeetingRoom> listAvailableRooms() {
        LambdaQueryWrapper<MeetingRoom> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MeetingRoom::getStatus, 1)
                .orderByAsc(MeetingRoom::getCode);
        return list(wrapper);
    }

    @Override
    public MeetingRoom getRoomById(Long id) {
        return getById(id);
    }

    @Override
    public boolean addRoom(MeetingRoom room) {
        return save(room);
    }

    @Override
    public boolean updateRoom(MeetingRoom room) {
        return updateById(room);
    }

    @Override
    public boolean deleteRoom(Long id) {
        return removeById(id);
    }
}
