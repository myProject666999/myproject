package com.market.stall.controller;

import com.market.stall.common.Result;
import com.market.stall.dto.StallDTO;
import com.market.stall.service.StallService;
import com.market.stall.vo.StallMapVO;
import com.market.stall.vo.StallVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/stall")
@RequiredArgsConstructor
public class StallController {

    private final StallService stallService;

    @GetMapping("/event/{eventId}")
    public Result<List<StallVO>> getByEvent(@PathVariable Long eventId) {
        return Result.success(stallService.getStallsByEvent(eventId));
    }

    @GetMapping("/event/{eventId}/map")
    public Result<StallMapVO> getStallMap(@PathVariable Long eventId) {
        return Result.success(stallService.getStallMap(eventId));
    }

    @PostMapping
    public Result<Void> create(@RequestBody @Valid StallDTO dto) {
        stallService.createStall(dto);
        return Result.success();
    }

    @PostMapping("/batch")
    public Result<Void> batchCreate(@RequestBody @Valid List<StallDTO> dtoList) {
        stallService.batchCreateStalls(dtoList);
        return Result.success();
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody @Valid StallDTO dto) {
        stallService.updateStall(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        stallService.deleteStall(id);
        return Result.success();
    }
}
