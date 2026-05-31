package com.market.stall.controller;

import com.market.stall.common.Result;
import com.market.stall.dto.CheckInDTO;
import com.market.stall.service.CheckInService;
import com.market.stall.vo.CheckInVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/checkin")
@RequiredArgsConstructor
public class CheckInController {

    private final CheckInService checkInService;

    private Long getCurrentUserId() {
        Object principal = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        if (principal instanceof Long) {
            return (Long) principal;
        }
        return Long.parseLong(principal.toString());
    }

    @PostMapping("/generate-code/{registrationId}")
    public Result<String> generateCode(@PathVariable Long registrationId) {
        return Result.success(checkInService.generateCheckInCode(registrationId, getCurrentUserId()));
    }

    @PostMapping
    public Result<CheckInVO> checkIn(@RequestBody @Valid CheckInDTO dto) {
        return Result.success(checkInService.checkIn(dto, getCurrentUserId()));
    }

    @GetMapping("/event/{eventId}")
    public Result<List<CheckInVO>> listByEvent(@PathVariable Long eventId) {
        return Result.success(checkInService.getCheckInList(eventId));
    }
}
