package com.votingscheduling.controller;

import com.votingscheduling.common.Result;
import com.votingscheduling.entity.ShiftSwap;
import com.votingscheduling.security.JwtTokenProvider;
import com.votingscheduling.service.ShiftSwapService;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shift-swaps")
@RequiredArgsConstructor
public class ShiftSwapController {

    private final ShiftSwapService shiftSwapService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/my")
    public Result<List<ShiftSwap>> getMySwaps(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        return Result.success(shiftSwapService.findByUser(userId));
    }

    @GetMapping("/{id}")
    public Result<ShiftSwap> getById(@PathVariable Long id) {
        return Result.success(shiftSwapService.findById(id));
    }

    @GetMapping("/status/{status}")
    public Result<List<ShiftSwap>> getByStatus(@PathVariable String status) {
        return Result.success(shiftSwapService.findByStatus(status));
    }

    @PostMapping
    public Result<ShiftSwap> create(@RequestBody ShiftSwap swap, HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        return Result.success(shiftSwapService.create(swap, userId));
    }

    @PostMapping("/{id}/approve")
    public Result<ShiftSwap> approve(@PathVariable Long id,
                                      @RequestParam(required = false) String comment,
                                      HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        return Result.success(shiftSwapService.approve(id, userId, comment));
    }

    @PostMapping("/{id}/reject")
    public Result<ShiftSwap> reject(@PathVariable Long id,
                                     @RequestParam(required = false) String comment,
                                     HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        return Result.success(shiftSwapService.reject(id, userId, comment));
    }

    @PostMapping("/{id}/cancel")
    public Result<ShiftSwap> cancel(@PathVariable Long id, HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        return Result.success(shiftSwapService.cancel(id, userId));
    }
}
