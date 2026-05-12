
package com.beautyhair.service;

import com.beautyhair.mapper.AppointmentMapper;
import com.beautyhair.mapper.MemberMapper;
import com.beautyhair.mapper.OrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MemberMapper memberMapper;
    private final AppointmentMapper appointmentMapper;
    private final OrderMapper orderMapper;

    public Map<String, Object> getDashboardData() {
        Map<String, Object> data = new HashMap<>();

        LocalDate today = LocalDate.now();

        Long totalMembers = memberMapper.selectCount(null);
        Long todayBirthdays = memberMapper.countTodayBirthdays();
        Long newMembers = memberMapper.countNewMembersLast30Days();
        Long todayAppointments = appointmentMapper.countByDate(today);
        Long completedAppointments = appointmentMapper.countCompletedByDate(today);
        java.math.BigDecimal todayRevenue = orderMapper.sumRevenueByDate(today);
        if (todayRevenue == null) {
            todayRevenue = java.math.BigDecimal.ZERO;
        }

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalMembers", totalMembers);
        statistics.put("todayBirthdays", todayBirthdays);
        statistics.put("newMembersLast30Days", newMembers);
        statistics.put("todayAppointments", todayAppointments);
        statistics.put("completedAppointments", completedAppointments);
        statistics.put("todayRevenue", todayRevenue);

        List<Map<String, Object>> last7DaysRevenue = orderMapper.getLast7DaysRevenue();

        data.put("statistics", statistics);
        data.put("last7DaysRevenue", last7DaysRevenue);

        return data;
    }
}
