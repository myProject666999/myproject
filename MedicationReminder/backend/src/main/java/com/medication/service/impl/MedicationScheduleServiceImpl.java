package com.medication.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.medication.entity.MedicationSchedule;
import com.medication.entity.Medicine;
import com.medication.entity.User;
import com.medication.mapper.MedicationScheduleMapper;
import com.medication.service.MedicationScheduleService;
import com.medication.service.MedicineService;
import com.medication.service.UserService;
import com.medication.vo.ScheduleVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicationScheduleServiceImpl extends ServiceImpl<MedicationScheduleMapper, MedicationSchedule> implements MedicationScheduleService {

    @Autowired
    private MedicineService medicineService;

    @Autowired
    private UserService userService;

    @Override
    public List<ScheduleVO> listByUserId(Long userId) {
        List<MedicationSchedule> schedules = lambdaQuery()
                .eq(MedicationSchedule::getUserId, userId)
                .eq(MedicationSchedule::getStatus, 1)
                .list();
        return convertToVOList(schedules);
    }

    @Override
    public List<ScheduleVO> listTodayByUserId(Long userId) {
        LocalDate today = LocalDate.now();
        int dayOfWeek = today.getDayOfWeek().getValue();

        List<MedicationSchedule> allSchedules = lambdaQuery()
                .eq(MedicationSchedule::getUserId, userId)
                .eq(MedicationSchedule::getStatus, 1)
                .list();

        List<MedicationSchedule> todaySchedules = new ArrayList<>();

        for (MedicationSchedule schedule : allSchedules) {
            if (schedule.getStartDate() != null && today.isBefore(schedule.getStartDate())) {
                continue;
            }
            if (schedule.getEndDate() != null && today.isAfter(schedule.getEndDate())) {
                continue;
            }

            String frequencyType = schedule.getFrequencyType();
            if ("daily".equals(frequencyType)) {
                todaySchedules.add(schedule);
            } else if ("alternate_day".equals(frequencyType)) {
                LocalDate start = schedule.getStartDate();
                if (start != null) {
                    long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(start, today);
                    if (daysBetween >= 0 && daysBetween % 2 == 0) {
                        todaySchedules.add(schedule);
                    }
                }
            } else if ("weekly".equals(frequencyType)) {
                String weekDays = schedule.getWeekDays();
                if (weekDays != null && !weekDays.isEmpty()) {
                    List<Integer> days = Arrays.stream(weekDays.split(","))
                            .map(Integer::parseInt)
                            .collect(Collectors.toList());
                    if (days.contains(dayOfWeek)) {
                        todaySchedules.add(schedule);
                    }
                }
            }
        }

        return convertToVOList(todaySchedules);
    }

    @Override
    public List<ScheduleVO> listAll() {
        List<MedicationSchedule> schedules = list();
        return convertToVOList(schedules);
    }

    private List<ScheduleVO> convertToVOList(List<MedicationSchedule> schedules) {
        List<ScheduleVO> voList = new ArrayList<>();
        for (MedicationSchedule schedule : schedules) {
            ScheduleVO vo = new ScheduleVO();
            vo.setId(schedule.getId());
            vo.setUserId(schedule.getUserId());
            vo.setMedicineId(schedule.getMedicineId());
            vo.setDosage(schedule.getDosage());
            vo.setFrequencyType(schedule.getFrequencyType());
            vo.setFrequencyDesc(getFrequencyDesc(schedule));
            vo.setWeekDays(schedule.getWeekDays());
            vo.setTimeSlots(schedule.getTimeSlots());
            vo.setStartDate(schedule.getStartDate());
            vo.setEndDate(schedule.getEndDate());
            vo.setStatus(schedule.getStatus());
            vo.setRemark(schedule.getRemark());

            User user = userService.getById(schedule.getUserId());
            if (user != null) {
                vo.setUserName(user.getName());
            }

            Medicine medicine = medicineService.getById(schedule.getMedicineId());
            if (medicine != null) {
                vo.setMedicineName(medicine.getName());
                vo.setSpecification(medicine.getSpecification());
            }

            voList.add(vo);
        }
        return voList;
    }

    private String getFrequencyDesc(MedicationSchedule schedule) {
        String type = schedule.getFrequencyType();
        if ("daily".equals(type)) {
            return "每日";
        } else if ("alternate_day".equals(type)) {
            return "隔日";
        } else if ("weekly".equals(type)) {
            String weekDays = schedule.getWeekDays();
            if (weekDays != null && !weekDays.isEmpty()) {
                String[] days = {"一", "二", "三", "四", "五", "六", "日"};
                StringBuilder sb = new StringBuilder("每周");
                String[] dayArr = weekDays.split(",");
                for (int i = 0; i < dayArr.length; i++) {
                    if (i > 0) sb.append("、");
                    int dayNum = Integer.parseInt(dayArr[i]);
                    sb.append("周").append(days[dayNum - 1]);
                }
                return sb.toString();
            }
            return "每周";
        }
        return type;
    }
}
