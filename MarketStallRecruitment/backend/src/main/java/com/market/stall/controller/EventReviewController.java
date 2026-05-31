package com.market.stall.controller;

import com.market.stall.common.Result;
import com.market.stall.service.EventReviewService;
import com.market.stall.vo.EventReviewVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/review")
@RequiredArgsConstructor
public class EventReviewController {

    private final EventReviewService eventReviewService;

    @GetMapping("/{eventId}")
    public Result<EventReviewVO> review(@PathVariable Long eventId) {
        return Result.success(eventReviewService.getEventReview(eventId));
    }
}
