package com.fishing.reservation.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fishing.reservation.common.Result;
import com.fishing.reservation.entity.PondReservation;
import com.fishing.reservation.mapper.PondReservationMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reservation")
public class ReservationController {

    @Autowired
    private PondReservationMapper reservationMapper;

    @GetMapping("/list")
    public Result<List<PondReservation>> list(@RequestParam(required = false) Long userId) {
        LambdaQueryWrapper<PondReservation> wrapper = new LambdaQueryWrapper<>();
        if (userId != null) {
            wrapper.eq(PondReservation::getUserId, userId);
        }
        wrapper.orderByDesc(PondReservation::getCreateTime);
        List<PondReservation> list = reservationMapper.selectList(wrapper);
        return Result.success(list);
    }

    @GetMapping("/check")
    public Result<Boolean> check(@RequestParam Long pondId, @RequestParam String date) {
        LocalDate reservationDate = LocalDate.parse(date);
        Long count = reservationMapper.selectCount(
            new LambdaQueryWrapper<PondReservation>()
                .eq(PondReservation::getPondId, pondId)
                .eq(PondReservation::getReservationDate, reservationDate)
                .in(PondReservation::getStatus, 0, 1)
        );
        return Result.success(count == 0);
    }

    @PostMapping
    public Result<PondReservation> create(@RequestBody PondReservation reservation) {
        LambdaQueryWrapper<PondReservation> checkWrapper = new LambdaQueryWrapper<>();
        checkWrapper.eq(PondReservation::getPondId, reservation.getPondId())
                    .eq(PondReservation::getReservationDate, reservation.getReservationDate())
                    .in(PondReservation::getStatus, 0, 1);
        if (reservationMapper.selectCount(checkWrapper) > 0) {
            return Result.error("该日期塘位已被预订");
        }

        reservation.setStatus(0);
        reservation.setQrCode(UUID.randomUUID().toString().replace("-", ""));
        reservationMapper.insert(reservation);
        return Result.success("预订成功", reservation);
    }

    @PutMapping("/{id}/status")
    public Result<PondReservation> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        PondReservation reservation = reservationMapper.selectById(id);
        if (reservation == null) {
            return Result.error("预订不存在");
        }
        reservation.setStatus(status);
        reservationMapper.updateById(reservation);
        return Result.success("状态更新成功", reservation);
    }

    @DeleteMapping("/{id}")
    public Result<Void> cancel(@PathVariable Long id) {
        PondReservation reservation = reservationMapper.selectById(id);
        if (reservation == null) {
            return Result.error("预订不存在");
        }
        reservation.setStatus(-1);
        reservationMapper.updateById(reservation);
        return Result.success(null);
    }
}
