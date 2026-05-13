package com.court.reservation.controller;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.court.reservation.common.Result;
import com.court.reservation.entity.*;
import com.court.reservation.mapper.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/reservation")
public class ReservationController {

    @Resource
    private ReservationMapper reservationMapper;

    @Resource
    private CourtMapper courtMapper;

    @Resource
    private UserMapper userMapper;

    @Resource
    private CardMapper cardMapper;

    @Resource
    private GateRecordMapper gateRecordMapper;

    private static final List<String> TIME_SLOTS = Arrays.asList(
            "08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00",
            "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00",
            "16:00-17:00", "17:00-18:00", "18:00-19:00", "19:00-20:00",
            "20:00-21:00", "21:00-22:00"
    );

    @GetMapping("/slots")
    public Result<Map<String, Object>> getAvailableSlots(
            @RequestParam String date,
            @RequestParam(required = false) String courtType) {
        LocalDate reservationDate = LocalDate.parse(date);

        QueryWrapper<Court> courtWrapper = new QueryWrapper<>();
        courtWrapper.eq("status", 1);
        if (courtType != null && !courtType.isEmpty()) {
            courtWrapper.eq("type", courtType);
        }
        List<Court> courts = courtMapper.selectList(courtWrapper);

        QueryWrapper<Reservation> reservationWrapper = new QueryWrapper<>();
        reservationWrapper.eq("date", reservationDate);
        reservationWrapper.in("status", Arrays.asList(0, 1));
        List<Reservation> reservations = reservationMapper.selectList(reservationWrapper);

        Map<Long, Set<String>> bookedSlots = new HashMap<>();
        for (Reservation r : reservations) {
            bookedSlots.computeIfAbsent(r.getCourtId(), k -> new HashSet<>()).add(r.getTimeSlot());
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Court court : courts) {
            Map<String, Object> courtData = new HashMap<>();
            courtData.put("court", court);
            List<Map<String, Object>> slots = new ArrayList<>();
            for (String slot : TIME_SLOTS) {
                Map<String, Object> slotData = new HashMap<>();
                slotData.put("timeSlot", slot);
                boolean booked = bookedSlots.getOrDefault(court.getId(), Collections.emptySet()).contains(slot);
                slotData.put("status", booked ? "booked" : "available");
                slots.add(slotData);
            }
            courtData.put("slots", slots);
            result.add(courtData);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("date", date);
        response.put("timeSlots", TIME_SLOTS);
        response.put("courts", result);
        return Result.success(response);
    }

    @PostMapping
    @Transactional
    public Result<Reservation> create(@RequestBody Map<String, Object> params) {
        Long userId = Long.valueOf(params.get("userId").toString());
        Long courtId = Long.valueOf(params.get("courtId").toString());
        LocalDate date = LocalDate.parse(params.get("date").toString());
        String timeSlot = params.get("timeSlot").toString();
        String paymentType = params.get("paymentType").toString();

        Court court = courtMapper.selectById(courtId);
        if (court == null) {
            throw new RuntimeException("场地不存在");
        }

        QueryWrapper<Reservation> checkWrapper = new QueryWrapper<>();
        checkWrapper.eq("court_id", courtId)
                .eq("date", date)
                .eq("time_slot", timeSlot)
                .in("status", Arrays.asList(0, 1));
        if (reservationMapper.selectCount(checkWrapper) > 0) {
            throw new RuntimeException("该时段已被预约");
        }

        Reservation reservation = new Reservation();
        reservation.setUserId(userId);
        reservation.setCourtId(courtId);
        reservation.setDate(date);
        reservation.setTimeSlot(timeSlot);
        reservation.setPrice(court.getPrice());
        reservation.setPaymentType(paymentType);
        reservation.setStatus(0);
        reservation.setQrCode(IdUtil.simpleUUID());
        reservation.setCreateTime(LocalDateTime.now());
        reservation.setUpdateTime(LocalDateTime.now());

        if ("card".equals(paymentType)) {
            Long cardId = Long.valueOf(params.get("cardId").toString());
            Card card = cardMapper.selectById(cardId);
            if (card == null || !card.getUserId().equals(userId)) {
                throw new RuntimeException("会员卡无效");
            }
            if (card.getStatus() == 0) {
                throw new RuntimeException("会员卡已失效");
            }
            if ("MONTHLY".equals(card.getCardType())) {
                if (card.getRemainingTimes() <= 0) {
                    throw new RuntimeException("月卡次数不足");
                }
                card.setRemainingTimes(card.getRemainingTimes() - 1);
                cardMapper.updateById(card);
            } else if ("STORED".equals(card.getCardType())) {
                if (card.getBalance() < court.getPrice()) {
                    throw new RuntimeException("储值卡余额不足");
                }
                card.setBalance(card.getBalance() - court.getPrice());
                cardMapper.updateById(card);
            }
            reservation.setCardId(cardId);
        } else if ("balance".equals(paymentType)) {
            User user = userMapper.selectById(userId);
            if (user.getBalance() < court.getPrice()) {
                throw new RuntimeException("余额不足");
            }
            user.setBalance(user.getBalance() - court.getPrice());
            userMapper.updateById(user);
        }

        reservationMapper.insert(reservation);
        return Result.success(reservation);
    }

    @GetMapping("/list")
    public Result<List<Reservation>> list(@RequestParam Long userId) {
        QueryWrapper<Reservation> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).orderByDesc("create_time");
        return Result.success(reservationMapper.selectList(wrapper));
    }

    @GetMapping("/{id}")
    public Result<Reservation> getById(@PathVariable Long id) {
        return Result.success(reservationMapper.selectById(id));
    }

    @PutMapping("/{id}/cancel")
    public Result<Void> cancel(@PathVariable Long id) {
        Reservation reservation = reservationMapper.selectById(id);
        if (reservation == null) {
            throw new RuntimeException("预约不存在");
        }
        if (reservation.getStatus() != 0) {
            throw new RuntimeException("预约状态不允许取消");
        }
        reservation.setStatus(2);
        reservation.setUpdateTime(LocalDateTime.now());
        reservationMapper.updateById(reservation);
        return Result.success();
    }

    @PostMapping("/gate/verify")
    @Transactional
    public Result<Map<String, Object>> verifyQrCode(@RequestBody Map<String, String> params) {
        String qrCode = params.get("qrCode");
        String action = params.get("action");

        QueryWrapper<Reservation> wrapper = new QueryWrapper<>();
        wrapper.eq("qr_code", qrCode);
        Reservation reservation = reservationMapper.selectOne(wrapper);

        if (reservation == null) {
            return Result.error("无效的二维码");
        }

        LocalDate today = LocalDate.now();
        if (!reservation.getDate().equals(today)) {
            return Result.error("预约日期无效");
        }

        if (reservation.getStatus() == 2) {
            return Result.error("预约已取消");
        }

        if (reservation.getStatus() == 3) {
            return Result.error("预约已完成");
        }

        GateRecord record = new GateRecord();
        record.setReservationId(reservation.getId());
        record.setUserId(reservation.getUserId());
        record.setQrCode(qrCode);
        record.setAction(action);
        record.setGateTime(LocalDateTime.now());
        gateRecordMapper.insert(record);

        if ("out".equals(action)) {
            reservation.setStatus(3);
            reservation.setUpdateTime(LocalDateTime.now());
            reservationMapper.updateById(reservation);
        } else if ("in".equals(action) && reservation.getStatus() == 0) {
            reservation.setStatus(1);
            reservation.setUpdateTime(LocalDateTime.now());
            reservationMapper.updateById(reservation);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("reservation", reservation);
        result.put("verified", true);
        return Result.success(result);
    }
}