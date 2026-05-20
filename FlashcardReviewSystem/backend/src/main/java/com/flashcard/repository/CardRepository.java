package com.flashcard.repository;

import com.flashcard.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {

    List<Card> findByDeckId(Long deckId);

    @Query("SELECT c FROM Card c WHERE c.nextReviewDate <= :now ORDER BY c.nextReviewDate ASC")
    List<Card> findDueCards(@Param("now") LocalDateTime now);

    @Query("SELECT c FROM Card c WHERE c.deckId = :deckId AND c.nextReviewDate <= :now ORDER BY c.nextReviewDate ASC")
    List<Card> findDueCardsByDeckId(@Param("deckId") Long deckId, @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(c) FROM Card c WHERE c.nextReviewDate <= :now")
    long countDueCards(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(c) FROM Card c WHERE c.deckId = :deckId AND c.nextReviewDate <= :now")
    long countDueCardsByDeckId(@Param("deckId") Long deckId, @Param("now") LocalDateTime now);

    long countByDeckId(Long deckId);
}
