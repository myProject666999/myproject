package com.meeting.controller;

import com.meeting.dto.*;
import com.meeting.entity.Reservation;
import com.meeting.service.ReservationService;
import com.meeting.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/reservations")
@CrossOrigin(origins = "*")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    public Result<Void> create(@Valid @RequestBody ReservationCreateDTO dto, HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        reservationService.createReservation(dto, userId);
        return Result.success("预订成功", null);
    }

    @PostMapping("/cancel")
    public Result<Void> cancel(@RequestBody ReservationCancelDTO dto, HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        reservationService.cancelReservation(dto, userId);
        return Result.success("取消成功", null);
    }

    @GetMapping("/my")
    public Result<List<Reservation>> myReservations(HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        return Result.success(reservationService.getMyReservations(userId));
    }

    @GetMapping("/room/{roomId}")
    public Result<List<Reservation>> roomReservations(@PathVariable Long roomId) {
        return Result.success(reservationService.getRoomReservations(roomId));
    }

    @GetMapping("/page")
    public Result<PageResult<Reservation>> page(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            ReservationQueryDTO query) {
        return Result.success(reservationService.getReservationPage(pageNum, pageSize, query));
    }

    @GetMapping("/check")
    public Result<Boolean> checkAvailability(
            @RequestParam Long roomId,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        return Result.success(reservationService.checkAvailability(roomId, startTime, endTime));
    }

    private Long getUserIdFromToken(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            return jwtUtil.getUserIdFromToken(token);
        }
        return null;
    }
}
