package com.market.stall.controller;

import com.market.stall.common.Result;
import com.market.stall.dto.StallSelectDTO;
import com.market.stall.service.StallSelectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController
@RequestMapping("/stall-selection")
@RequiredArgsConstructor
public class StallSelectionController {

    private final StallSelectionService stallSelectionService;

    private Long getCurrentUserId() {
        Object principal = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        if (principal instanceof Long) {
            return (Long) principal;
        }
        return Long.parseLong(principal.toString());
    }

    @PostMapping("/select")
    public Result<Void> selectStall(@RequestBody @Valid StallSelectDTO dto) {
        stallSelectionService.selectStall(dto, getCurrentUserId());
        return Result.success();
    }

    @PostMapping("/release-expired")
    public Result<Void> releaseExpired() {
        stallSelectionService.releaseExpiredLocks();
        return Result.success();
    }
}
