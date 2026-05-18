package com.gtd.service;

import com.gtd.entity.WeeklyReview;
import com.gtd.repository.WeeklyReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Optional;

@Service
public class WeeklyReviewService {

    @Autowired
    private WeeklyReviewRepository weeklyReviewRepository;

    @Autowired
    private TaskService taskService;

    public List<WeeklyReview> getAllReviews(Long userId) {
        return weeklyReviewRepository.findByUserIdOrderByReviewDateDesc(userId);
    }

    public Optional<WeeklyReview> getReviewById(Long id) {
        return weeklyReviewRepository.findById(id);
    }

    public WeeklyReview generateWeeklyReview(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        LocalDateTime startDateTime = weekStart.atStartOfDay();
        LocalDateTime endDateTime = weekEnd.atTime(LocalTime.MAX);

        WeeklyReview review = new WeeklyReview();
        review.setUserId(userId);
        review.setReviewDate(today);
        review.setWeekStartDate(weekStart);
        review.setWeekEndDate(weekEnd);
        review.setTasksCompleted(taskService.countCompletedTasksInRange(userId, startDateTime, endDateTime));
        review.setTasksCreated(taskService.countCreatedTasksInRange(userId, startDateTime, endDateTime));
        review.setInboxProcessed(0);
        review.setProjectsActive(0);

        return review;
    }

    public WeeklyReview saveReview(WeeklyReview review) {
        return weeklyReviewRepository.save(review);
    }

    public void deleteReview(Long id) {
        weeklyReviewRepository.deleteById(id);
    }
}
