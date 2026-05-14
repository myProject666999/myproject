package com.fishing.reservation.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fishing.reservation.common.Result;
import com.fishing.reservation.entity.LiveStream;
import com.fishing.reservation.mapper.LiveStreamMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/live")
public class LiveStreamController {

    @Autowired
    private LiveStreamMapper liveStreamMapper;

    @GetMapping("/active")
    public Result<LiveStream> active() {
        LiveStream stream = liveStreamMapper.selectOne(
            new LambdaQueryWrapper<LiveStream>()
                .eq(LiveStream::getStatus, 1)
                .orderByDesc(LiveStream::getCreateTime)
                .last("LIMIT 1")
        );
        return Result.success(stream);
    }

    @GetMapping("/list")
    public Result<List<LiveStream>> list() {
        List<LiveStream> list = liveStreamMapper.selectList(
            new LambdaQueryWrapper<LiveStream>().orderByDesc(LiveStream::getCreateTime)
        );
        return Result.success(list);
    }

    @PostMapping
    public Result<LiveStream> create(@RequestBody LiveStream stream) {
        stream.setStatus(0);
        liveStreamMapper.insert(stream);
        return Result.success("创建成功", stream);
    }

    @PutMapping("/{id}/start")
    public Result<LiveStream> start(@PathVariable Long id) {
        LiveStream stream = liveStreamMapper.selectById(id);
        if (stream == null) {
            return Result.error("直播不存在");
        }
        stream.setStatus(1);
        stream.setStartTime(java.time.LocalDateTime.now());
        liveStreamMapper.updateById(stream);
        return Result.success("直播已开始", stream);
    }

    @PutMapping("/{id}/stop")
    public Result<LiveStream> stop(@PathVariable Long id) {
        LiveStream stream = liveStreamMapper.selectById(id);
        if (stream == null) {
            return Result.error("直播不存在");
        }
        stream.setStatus(0);
        stream.setEndTime(java.time.LocalDateTime.now());
        liveStreamMapper.updateById(stream);
        return Result.success("直播已结束", stream);
    }

    @PutMapping("/{id}/view")
    public Result<Void> incrementView(@PathVariable Long id) {
        LiveStream stream = liveStreamMapper.selectById(id);
        if (stream != null) {
            stream.setViewCount(stream.getViewCount() == null ? 1 : stream.getViewCount() + 1);
            liveStreamMapper.updateById(stream);
        }
        return Result.success(null);
    }
}
