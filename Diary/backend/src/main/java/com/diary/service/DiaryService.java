package com.diary.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.diary.dto.DiaryDTO;
import com.diary.entity.Diary;
import com.diary.entity.DiaryTag;
import com.diary.entity.MoodTag;
import com.diary.mapper.DiaryMapper;
import com.diary.mapper.DiaryTagMapper;
import com.diary.mapper.MoodTagMapper;
import com.diary.util.EncryptionUtil;
import com.diary.util.MoodExtractor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DiaryService {

    @Autowired
    private DiaryMapper diaryMapper;

    @Autowired
    private MoodTagMapper moodTagMapper;

    @Autowired
    private DiaryTagMapper diaryTagMapper;

    @Transactional
    public Diary saveDiary(DiaryDTO dto) {
        Diary existingDiary = diaryMapper.findByUserIdAndDate(dto.getUserId(), dto.getDiaryDate());

        String decryptedContent = dto.getContent();
        List<MoodTag> extractedTags = MoodExtractor.extractTags(decryptedContent);
        int finalScore = MoodExtractor.calculateMoodScore(extractedTags, dto.getMoodScore());
        String summary = MoodExtractor.generateMoodSummary(extractedTags);

        Diary diary;
        if (existingDiary != null) {
            diary = existingDiary;
            diary.setTitle(dto.getTitle());
            diary.setContent(EncryptionUtil.encrypt(decryptedContent));
            diary.setMoodScore(finalScore);
            diary.setMoodSummary(summary);
            diaryMapper.updateById(diary);
            diaryTagMapper.deleteByDiaryId(diary.getId());
        } else {
            diary = new Diary();
            diary.setUserId(dto.getUserId());
            diary.setTitle(dto.getTitle());
            diary.setContent(EncryptionUtil.encrypt(decryptedContent));
            diary.setMoodScore(finalScore);
            diary.setMoodSummary(summary);
            diary.setDiaryDate(dto.getDiaryDate());
            diaryMapper.insert(diary);
        }

        for (MoodTag tag : extractedTags) {
            QueryWrapper<MoodTag> wrapper = new QueryWrapper<>();
            wrapper.eq("name", tag.getName());
            MoodTag existingTag = moodTagMapper.selectOne(wrapper);

            if (existingTag != null) {
                DiaryTag diaryTag = new DiaryTag();
                diaryTag.setDiaryId(diary.getId());
                diaryTag.setTagId(existingTag.getId());
                diaryTagMapper.insert(diaryTag);
            }
        }

        diary.setContent(decryptedContent);
        diary.setTags(extractedTags);
        return diary;
    }

    public Diary getTodayDiary(Long userId) {
        LocalDate today = LocalDate.now();
        Diary diary = diaryMapper.findByUserIdAndDate(userId, today);
        if (diary != null) {
            diary.setContent(EncryptionUtil.decrypt(diary.getContent()));
            diary.setTags(moodTagMapper.findByDiaryId(diary.getId()));
        }
        return diary;
    }

    public Diary getDiaryById(Long id) {
        Diary diary = diaryMapper.selectById(id);
        if (diary != null) {
            diary.setContent(EncryptionUtil.decrypt(diary.getContent()));
            diary.setTags(moodTagMapper.findByDiaryId(diary.getId()));
        }
        return diary;
    }

    public Page<Diary> getDiaryList(Long userId, int page, int size) {
        QueryWrapper<Diary> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        wrapper.orderByDesc("diary_date");

        Page<Diary> pageResult = diaryMapper.selectPage(new Page<>(page, size), wrapper);

        for (Diary diary : pageResult.getRecords()) {
            diary.setContent(EncryptionUtil.decrypt(diary.getContent()));
            diary.setTags(moodTagMapper.findByDiaryId(diary.getId()));
        }

        return pageResult;
    }

    public List<Map<String, Object>> getMonthlyMoodTrend(Long userId, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<Diary> diaries = diaryMapper.findByUserIdAndDateRange(userId, startDate, endDate);

        List<Map<String, Object>> result = new ArrayList<>();
        LocalDate date = startDate;
        while (!date.isAfter(endDate)) {
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", date.toString());

            final LocalDate currentDate = date;
            Diary diary = diaries.stream()
                    .filter(d -> d.getDiaryDate().equals(currentDate))
                    .findFirst()
                    .orElse(null);

            if (diary != null) {
                dayData.put("moodScore", diary.getMoodScore());
                dayData.put("moodSummary", diary.getMoodSummary());
                dayData.put("hasDiary", true);
            } else {
                dayData.put("moodScore", null);
                dayData.put("moodSummary", null);
                dayData.put("hasDiary", false);
            }

            result.add(dayData);
            date = date.plusDays(1);
        }

        return result;
    }

    public Map<String, Object> getMoodStatistics(Long userId, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<Diary> diaries = diaryMapper.findByUserIdAndDateRange(userId, startDate, endDate);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDiaries", diaries.size());

        if (!diaries.isEmpty()) {
            double avgScore = diaries.stream()
                    .mapToInt(Diary::getMoodScore)
                    .average()
                    .orElse(0.0);
            stats.put("averageMoodScore", String.format("%.1f", avgScore));

            long positiveCount = diaries.stream()
                    .filter(d -> d.getMoodScore() >= 7)
                    .count();
            long neutralCount = diaries.stream()
                    .filter(d -> d.getMoodScore() >= 4 && d.getMoodScore() <= 6)
                    .count();
            long negativeCount = diaries.stream()
                    .filter(d -> d.getMoodScore() <= 3)
                    .count();

            Map<String, Long> categoryCount = new HashMap<>();
            categoryCount.put("积极", positiveCount);
            categoryCount.put("中性", neutralCount);
            categoryCount.put("消极", negativeCount);
            stats.put("moodDistribution", categoryCount);
        } else {
            stats.put("averageMoodScore", "0.0");
            Map<String, Long> categoryCount = new HashMap<>();
            categoryCount.put("积极", 0L);
            categoryCount.put("中性", 0L);
            categoryCount.put("消极", 0L);
            stats.put("moodDistribution", categoryCount);
        }

        return stats;
    }

    @Transactional
    public void deleteDiary(Long id) {
        diaryTagMapper.deleteByDiaryId(id);
        diaryMapper.deleteById(id);
    }
}
