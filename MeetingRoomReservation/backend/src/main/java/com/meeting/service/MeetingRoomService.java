package com.meeting.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.meeting.entity.MeetingRoom;

import java.util.List;

public interface MeetingRoomService extends IService<MeetingRoom> {

    List<MeetingRoom> listAvailableRooms();

    MeetingRoom getRoomById(Long id);

    boolean addRoom(MeetingRoom room);

    boolean updateRoom(MeetingRoom room);

    boolean deleteRoom(Long id);
}
