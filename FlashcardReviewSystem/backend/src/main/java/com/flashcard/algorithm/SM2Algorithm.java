package com.flashcard.algorithm;

import com.flashcard.entity.Card;
import com.flashcard.entity.ReviewLog;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class SM2Algorithm {

    private static final double MIN_EASE_FACTOR = 1.3;
    private static final double DEFAULT_EASE_FACTOR = 2.5;

    public static class ReviewResult {
        private final Card card;
        private final ReviewLog reviewLog;

        public ReviewResult(Card card, ReviewLog reviewLog) {
            this.card = card;
            this.reviewLog = reviewLog;
        }

        public Card getCard() {
            return card;
        }

        public ReviewLog getReviewLog() {
            return reviewLog;
        }
    }

    public ReviewResult reviewCard(Card card, int quality) {
        if (quality < 0 || quality > 5) {
            throw new IllegalArgumentException("Quality must be between 0 and 5");
        }

        double previousEaseFactor = card.getEaseFactor() != null ? card.getEaseFactor() : DEFAULT_EASE_FACTOR;
        int previousInterval = card.getReviewInterval() != null ? card.getReviewInterval() : 0;
        int previousRepetitions = card.getRepetitions() != null ? card.getRepetitions() : 0;

        ReviewLog reviewLog = new ReviewLog();
        reviewLog.setCardId(card.getId());
        reviewLog.setQuality(quality);
        reviewLog.setReviewDate(LocalDateTime.now());
        reviewLog.setPreviousReviewInterval(previousInterval);
        reviewLog.setPreviousEaseFactor(previousEaseFactor);

        int newInterval;
        int newRepetitions;
        double newEaseFactor;

        if (quality < 3) {
            newRepetitions = 0;
            newInterval = 1;
            newEaseFactor = previousEaseFactor;
        } else {
            if (previousRepetitions == 0) {
                newInterval = 1;
            } else if (previousRepetitions == 1) {
                newInterval = 6;
            } else {
                newInterval = (int) Math.round(previousInterval * previousEaseFactor);
            }
            newRepetitions = previousRepetitions + 1;

            newEaseFactor = previousEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
            if (newEaseFactor < MIN_EASE_FACTOR) {
                newEaseFactor = MIN_EASE_FACTOR;
            }
        }

        reviewLog.setNewReviewInterval(newInterval);
        reviewLog.setNewEaseFactor(newEaseFactor);

        card.setEaseFactor(newEaseFactor);
        card.setReviewInterval(newInterval);
        card.setRepetitions(newRepetitions);
        card.setLastReviewDate(LocalDateTime.now());
        card.setNextReviewDate(LocalDateTime.now().plusDays(newInterval));

        return new ReviewResult(card, reviewLog);
    }

    public boolean isCardDue(Card card) {
        if (card.getNextReviewDate() == null) {
            return true;
        }
        return card.getNextReviewDate().isBefore(LocalDateTime.now()) ||
               card.getNextReviewDate().isEqual(LocalDateTime.now());
    }
}
