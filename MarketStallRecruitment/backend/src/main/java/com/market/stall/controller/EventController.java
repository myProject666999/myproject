package com.market.stall.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.market.stall.common.PageResult;
import com.market.stall.common.Result;
import com.market.stall.dto.EventDTO;
import com.market.stall.entity.Event;
import com.market.stall.service.EventService;
import com.market.stall.vo.EventVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/event")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    private Long getCurrentUserId() {
        Object principal = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        if (principal instanceof Long) {
            return (Long) principal;
        }
        return Long.parseLong(principal.toString());
    }

    @GetMapping("/page")
    public Result<PageResult<EventVO>> page(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status) {
        IPage<Event> page = new Page<>(pageNum, pageSize);
        return Result.success(new PageResult<>(eventService.pageEvents(page, keyword, status)));
    }

    @GetMapping("/{id}")
    public Result<EventVO> detail(@PathVariable Long id) {
        return Result.success(eventService.getEventDetail(id));
    }

    @PostMapping
    public Result<Void> create(@RequestBody @Valid EventDTO dto) {
        eventService.createEvent(dto, getCurrentUserId());
        return Result.success();
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody @Valid EventDTO dto) {
        eventService.updateEvent(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return Result.success();
    }

    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        eventService.updateEventStatus(id, status);
        return Result.success();
    }
}
