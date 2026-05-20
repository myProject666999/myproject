package com.flashcard.service;

import com.flashcard.repository.CardRepository;
import com.flashcard.repository.ReviewLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class StatisticsService {

    private final CardRepository cardRepository;
    private final ReviewLogRepository reviewLogRepository;

    @Autowired
    public StatisticsService(CardRepository cardRepository, ReviewLogRepository reviewLogRepository) {
        this.cardRepository = cardRepository;
        this.reviewLogRepository = reviewLogRepository;
    }

    public Map<String, Object> getOverallStatistics() {
        Map<String, Object> stats = new HashMap<>();
        LocalDateTime now = LocalDateTime.now();

        long totalCards = cardRepository.count();
        long dueCards = cardRepository.countDueCards(now);
        long newCards = cardRepository.findAll().stream()
                .filter(card -> card.getRepetitions() == 0)
                .count();
        long learningCards = cardRepository.findAll().stream()
                .filter(card -> card.getRepetitions() > 0 && card.getRepetitions() < 3)
                .count();
        long reviewCards = cardRepository.findAll().stream()
                .filter(card -> card.getRepetitions() >= 3)
                .count();

        stats.put("totalCards", totalCards);
        stats.put("dueCards", dueCards);
        stats.put("newCards", newCards);
        stats.put("learningCards", learningCards);
        stats.put("reviewCards", reviewCards);

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = LocalDate.now().atTime(23, 59, 59);
        long todayReviews = reviewLogRepository.countReviewsBetween(todayStart, todayEnd);
        long todayCorrectReviews = reviewLogRepository.countCorrectReviewsBetween(todayStart, todayEnd);
        double todayAccuracy = todayReviews > 0 ? (double) todayCorrectReviews / todayReviews * 100 : 0;

        stats.put("todayReviews", todayReviews);
        stats.put("todayCorrectReviews", todayCorrectReviews);
        stats.put("todayAccuracy", Math.round(todayAccuracy * 100.0) / 100.0);

        return stats;
    }

    public Map<String, Object> getDeckStatistics(Long deckId) {
        Map<String, Object> stats = new HashMap<>();

        long totalCards = cardRepository.countByDeckId(deckId);
        long dueCards = cardRepository.countDueCardsByDeckId(deckId, LocalDateTime.now());
        long newCards = cardRepository.findByDeckId(deckId).stream()
                .filter(card -> card.getRepetitions() == 0)
                .count();

        stats.put("totalCards", totalCards);
        stats.put("dueCards", dueCards);
        stats.put("newCards", newCards);

        return stats;
    }
}
