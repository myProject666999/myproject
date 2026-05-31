package com.meeting.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.meeting.entity.Reservation;
import com.meeting.mapper.ReservationMapper;
import com.meeting.service.MeetingRoomService;
import com.meeting.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatisticsServiceImpl implements StatisticsService {

    @Autowired
    private ReservationMapper reservationMapper;

    @Autowired
    private MeetingRoomService meetingRoomService;

    @Override
    public List<Map<String, Object>> getRoomUsage(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        QueryWrapper<Reservation> wrapper = new QueryWrapper<>();
        wrapper.select("room_id", "COUNT(*) as reservation_count",
                        "SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)) as total_minutes")
                .eq("is_deleted", 0)
                .in("status", Arrays.asList(1, 2))
                .ge("start_time", start)
                .le("start_time", end)
                .groupBy("room_id");

        List<Map<String, Object>> rawData = reservationMapper.selectMaps(wrapper);

        Map<Long, Map<String, Object>> roomDataMap = new HashMap<>();
        for (Map<String, Object> row : rawData) {
            Long roomId = ((Number) row.get("room_id")).longValue();
            roomDataMap.put(roomId, row);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (var room : meetingRoomService.listAvailableRooms()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("roomId", room.getId());
            item.put("roomName", room.getName());
            item.put("roomCode", room.getCode());
            item.put("location", room.getLocation());
            item.put("capacity", room.getCapacity());

            Map<String, Object> stats = roomDataMap.getOrDefault(room.getId(), new HashMap<>());
            int reservationCount = stats.containsKey("reservation_count")
                    ? ((Number) stats.get("reservation_count")).intValue() : 0;
            long totalMinutes = stats.containsKey("total_minutes")
                    ? ((Number) stats.get("total_minutes")).longValue() : 0L;

            int days = (int) (endDate.toEpochDay() - startDate.toEpochDay()) + 1;
            double usageRate = days > 0 ? (double) totalMinutes / (days * 8 * 60) * 100 : 0;

            item.put("reservationCount", reservationCount);
            item.put("totalMinutes", totalMinutes);
            item.put("usageRate", Math.round(usageRate * 100.0) / 100.0);

            result.add(item);
        }

        return result;
    }

    @Override
    public Map<String, Object> getOverview(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        QueryWrapper<Reservation> wrapper = new QueryWrapper<>();
        wrapper.eq("is_deleted", 0)
                .ge("start_time", start)
                .le("start_time", end);

        long totalReservations = reservationMapper.selectCount(wrapper);

        wrapper.in("status", Arrays.asList(1, 2));
        long validReservations = reservationMapper.selectCount(wrapper);

        wrapper.eq("status", 0);
        long cancelledReservations = reservationMapper.selectCount(wrapper);

        QueryWrapper<Reservation> minutesWrapper = new QueryWrapper<>();
        minutesWrapper.select("COALESCE(SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)), 0) as total_minutes")
                .eq("is_deleted", 0)
                .in("status", Arrays.asList(1, 2))
                .ge("start_time", start)
                .le("start_time", end);

        List<Map<String, Object>> minutesResult = reservationMapper.selectMaps(minutesWrapper);
        long totalMinutes = minutesResult.isEmpty() ? 0 :
                ((Number) minutesResult.get(0).get("total_minutes")).longValue();

        int roomCount = meetingRoomService.listAvailableRooms().size();
        int days = (int) (endDate.toEpochDay() - startDate.toEpochDay()) + 1;
        double avgUsageRate = (roomCount > 0 && days > 0) ?
                (double) totalMinutes / (roomCount * days * 8 * 60) * 100 : 0;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalReservations", totalReservations);
        result.put("validReservations", validReservations);
        result.put("cancelledReservations", cancelledReservations);
        result.put("totalMinutes", totalMinutes);
        result.put("roomCount", roomCount);
        result.put("avgUsageRate", Math.round(avgUsageRate * 100.0) / 100.0);

        return result;
    }

    @Override
    public List<Map<String, Object>> getTrend(LocalDate startDate, LocalDate endDate) {
        List<Map<String, Object>> result = new ArrayList<>();
        LocalDate current = startDate;

        while (!current.isAfter(endDate)) {
            LocalDateTime dayStart = current.atStartOfDay();
            LocalDateTime dayEnd = current.atTime(LocalTime.MAX);

            QueryWrapper<Reservation> wrapper = new QueryWrapper<>();
            wrapper.eq("is_deleted", 0)
                    .in("status", Arrays.asList(1, 2))
                    .ge("start_time", dayStart)
                    .le("start_time", dayEnd);

            long count = reservationMapper.selectCount(wrapper);

            QueryWrapper<Reservation> minutesWrapper = new QueryWrapper<>();
            minutesWrapper.select("COALESCE(SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)), 0) as total_minutes")
                    .eq("is_deleted", 0)
                    .in("status", Arrays.asList(1, 2))
                    .ge("start_time", dayStart)
                    .le("start_time", dayEnd);

            List<Map<String, Object>> minutesResult = reservationMapper.selectMaps(minutesWrapper);
            long minutes = minutesResult.isEmpty() ? 0 :
                    ((Number) minutesResult.get(0).get("total_minutes")).longValue();

            int roomCount = meetingRoomService.listAvailableRooms().size();
            double usageRate = roomCount > 0 ? (double) minutes / (roomCount * 8 * 60) * 100 : 0;

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("date", current.toString());
            item.put("count", count);
            item.put("minutes", minutes);
            item.put("usageRate", Math.round(usageRate * 100.0) / 100.0);

            result.add(item);
            current = current.plusDays(1);
        }

        return result;
    }
}
