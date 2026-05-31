package com.meeting.controller;

import com.meeting.dto.Result;
import com.meeting.entity.MeetingRoom;
import com.meeting.service.MeetingRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rooms")
@CrossOrigin(origins = "*")
public class MeetingRoomController {

    @Autowired
    private MeetingRoomService meetingRoomService;

    @GetMapping("/list")
    public Result<List<MeetingRoom>> list() {
        return Result.success(meetingRoomService.listAvailableRooms());
    }

    @GetMapping("/{id}")
    public Result<MeetingRoom> detail(@PathVariable Long id) {
        return Result.success(meetingRoomService.getRoomById(id));
    }

    @PostMapping
    public Result<Void> add(@RequestBody MeetingRoom room) {
        meetingRoomService.addRoom(room);
        return Result.success("添加成功", null);
    }

    @PutMapping
    public Result<Void> update(@RequestBody MeetingRoom room) {
        meetingRoomService.updateRoom(room);
        return Result.success("更新成功", null);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        meetingRoomService.deleteRoom(id);
        return Result.success("删除成功", null);
    }
}
