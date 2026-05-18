package com.habit.tracking.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.habit.tracking.entity.CheckinRecord;
import com.habit.tracking.entity.Habit;
import com.habit.tracking.repository.CheckinRecordRepository;
import com.habit.tracking.repository.HabitRepository;
import com.habit.tracking.vo.HabitCheckinVO;
import com.habit.tracking.vo.HeatmapDataVO;
import com.habit.tracking.vo.RankingVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class HabitService {

    private static final long DEFAULT_USER_ID = 1L;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Autowired
    private HabitRepository habitRepository;

    @Autowired
    private CheckinRecordRepository checkinRecordRepository;

    public List<Habit> listHabits() {
        return habitRepository.selectList(new LambdaQueryWrapper<Habit>()
                .eq(Habit::getUserId, DEFAULT_USER_ID)
                .eq(Habit::getIsActive, 1)
                .orderByAsc(Habit::getSortOrder));
    }

    public List<HabitCheckinVO> listTodayHabits() {
        LocalDate today = LocalDate.now();
        List<Habit> habits = listHabits();
        List<HabitCheckinVO> result = new ArrayList<>();

        for (Habit habit : habits) {
            HabitCheckinVO vo = new HabitCheckinVO();
            vo.setId(habit.getId());
            vo.setName(habit.getName());
            vo.setIcon(habit.getIcon());
            vo.setColor(habit.getColor());
            vo.setDescription(habit.getDescription());
            vo.setTargetDays(habit.getTargetDays());

            Integer streak = calculateStreak(habit.getId(), today);
            vo.setCurrentStreak(streak);

            Integer total = checkinRecordRepository.selectCount(new LambdaQueryWrapper<CheckinRecord>()
                    .eq(CheckinRecord::getUserId, DEFAULT_USER_ID)
                    .eq(CheckinRecord::getHabitId, habit.getId())).intValue();
            vo.setTotalCheckins(total);

            boolean checked = checkinRecordRepository.selectCount(new LambdaQueryWrapper<CheckinRecord>()
                    .eq(CheckinRecord::getUserId, DEFAULT_USER_ID)
                    .eq(CheckinRecord::getHabitId, habit.getId())
                    .eq(CheckinRecord::getCheckinDate, today)) > 0;
            vo.setTodayChecked(checked);

            result.add(vo);
        }

        return result;
    }

    private int calculateStreak(Long habitId, LocalDate endDate) {
        List<LocalDate> dates = checkinRecordRepository.findCheckinDatesDesc(DEFAULT_USER_ID, habitId, endDate);
        if (dates.isEmpty()) {
            return 0;
        }

        int streak = 0;
        LocalDate current = endDate;

        for (LocalDate date : dates) {
            if (date.equals(current)) {
                streak++;
                current = current.minusDays(1);
            } else if (date.isBefore(current)) {
                break;
            }
        }

        return streak;
    }

    @Transactional
    public CheckinRecord checkin(Long habitId, String remark) {
        LocalDate today = LocalDate.now();

        CheckinRecord exist = checkinRecordRepository.selectOne(new LambdaQueryWrapper<CheckinRecord>()
                .eq(CheckinRecord::getUserId, DEFAULT_USER_ID)
                .eq(CheckinRecord::getHabitId, habitId)
                .eq(CheckinRecord::getCheckinDate, today));

        if (exist != null) {
            return exist;
        }

        CheckinRecord record = new CheckinRecord();
        record.setUserId(DEFAULT_USER_ID);
        record.setHabitId(habitId);
        record.setCheckinDate(today);
        record.setCheckinTime(java.time.LocalDateTime.now());
        record.setRemark(remark);
        record.setCreatedAt(java.time.LocalDateTime.now());

        checkinRecordRepository.insert(record);
        return record;
    }

    @Transactional
    public void cancelCheckin(Long habitId) {
        LocalDate today = LocalDate.now();
        checkinRecordRepository.delete(new LambdaQueryWrapper<CheckinRecord>()
                .eq(CheckinRecord::getUserId, DEFAULT_USER_ID)
                .eq(CheckinRecord::getHabitId, habitId)
                .eq(CheckinRecord::getCheckinDate, today));
    }

    public List<HeatmapDataVO> getHeatmapData(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<CheckinRecordRepository.CheckinCountVO> counts = checkinRecordRepository.findDailyCheckinCount(
                DEFAULT_USER_ID, startDate, endDate);

        Map<LocalDate, Integer> countMap = counts.stream()
                .collect(Collectors.toMap(
                        CheckinRecordRepository.CheckinCountVO::getCheckinDate,
                        CheckinRecordRepository.CheckinCountVO::getHabitCount
                ));

        List<HeatmapDataVO> result = new ArrayList<>();
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            Integer count = countMap.getOrDefault(current, 0);
            result.add(new HeatmapDataVO(current.format(DATE_FORMATTER), count));
            current = current.plusDays(1);
        }

        return result;
    }

    public List<RankingVO> getRanking() {
        List<Habit> habits = listHabits();
        LocalDate today = LocalDate.now();
        List<RankingVO> result = new ArrayList<>();

        for (Habit habit : habits) {
            RankingVO vo = new RankingVO();
            vo.setHabitId(habit.getId());
            vo.setHabitName(habit.getName());
            vo.setIcon(habit.getIcon());
            vo.setColor(habit.getColor());
            vo.setStreakDays(calculateStreak(habit.getId(), today));
            vo.setTotalCheckins(checkinRecordRepository.selectCount(new LambdaQueryWrapper<CheckinRecord>()
                    .eq(CheckinRecord::getUserId, DEFAULT_USER_ID)
                    .eq(CheckinRecord::getHabitId, habit.getId())).intValue());
            result.add(vo);
        }

        result.sort((a, b) -> b.getStreakDays().compareTo(a.getStreakDays()));
        return result;
    }

    public Map<String, Object> getTodayStats() {
        LocalDate today = LocalDate.now();
        List<Habit> habits = listHabits();

        int totalHabits = habits.size();
        int checkedToday = 0;
        int totalStreak = 0;

        for (Habit habit : habits) {
            boolean checked = checkinRecordRepository.selectCount(new LambdaQueryWrapper<CheckinRecord>()
                    .eq(CheckinRecord::getUserId, DEFAULT_USER_ID)
                    .eq(CheckinRecord::getHabitId, habit.getId())
                    .eq(CheckinRecord::getCheckinDate, today)) > 0;
            if (checked) checkedToday++;

            totalStreak += calculateStreak(habit.getId(), today);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalHabits", totalHabits);
        stats.put("checkedToday", checkedToday);
        stats.put("checkRate", totalHabits > 0 ? (int) (checkedToday * 100.0 / totalHabits) : 0);
        stats.put("avgStreak", totalHabits > 0 ? totalStreak / totalHabits : 0);
        stats.put("currentDate", today.format(DATE_FORMATTER));

        return stats;
    }

    @Transactional
    public Habit createHabit(Habit habit) {
        habit.setUserId(DEFAULT_USER_ID);
        habit.setIsActive(1);
        habit.setCreatedAt(java.time.LocalDateTime.now());
        habit.setUpdatedAt(java.time.LocalDateTime.now());
        habitRepository.insert(habit);
        return habit;
    }

    @Transactional
    public void deleteHabit(Long id) {
        Habit habit = habitRepository.selectById(id);
        if (habit != null) {
            habit.setIsActive(0);
            habit.setUpdatedAt(java.time.LocalDateTime.now());
            habitRepository.updateById(habit);
        }
    }
}
