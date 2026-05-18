package com.gtd.repository;

import com.gtd.entity.WeeklyReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WeeklyReviewRepository extends JpaRepository<WeeklyReview, Long> {
    List<WeeklyReview> findByUserIdOrderByReviewDateDesc(Long userId);
}
