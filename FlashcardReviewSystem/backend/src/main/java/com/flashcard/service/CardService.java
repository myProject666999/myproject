package com.flashcard.service;

import com.flashcard.algorithm.SM2Algorithm;
import com.flashcard.entity.Card;
import com.flashcard.entity.ReviewLog;
import com.flashcard.repository.CardRepository;
import com.flashcard.repository.ReviewLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CardService {

    private final CardRepository cardRepository;
    private final ReviewLogRepository reviewLogRepository;
    private final SM2Algorithm sm2Algorithm;

    @Autowired
    public CardService(CardRepository cardRepository, ReviewLogRepository reviewLogRepository, SM2Algorithm sm2Algorithm) {
        this.cardRepository = cardRepository;
        this.reviewLogRepository = reviewLogRepository;
        this.sm2Algorithm = sm2Algorithm;
    }

    public List<Card> getAllCards() {
        return cardRepository.findAll();
    }

    public Optional<Card> getCardById(Long id) {
        return cardRepository.findById(id);
    }

    public List<Card> getCardsByDeckId(Long deckId) {
        return cardRepository.findByDeckId(deckId);
    }

    public List<Card> getDueCards() {
        return cardRepository.findDueCards(LocalDateTime.now());
    }

    public List<Card> getDueCardsByDeckId(Long deckId) {
        return cardRepository.findDueCardsByDeckId(deckId, LocalDateTime.now());
    }

    public long countDueCards() {
        return cardRepository.countDueCards(LocalDateTime.now());
    }

    public long countDueCardsByDeckId(Long deckId) {
        return cardRepository.countDueCardsByDeckId(deckId, LocalDateTime.now());
    }

    public long countCardsByDeckId(Long deckId) {
        return cardRepository.countByDeckId(deckId);
    }

    @Transactional
    public Card createCard(Card card) {
        if (card.getNextReviewDate() == null) {
            card.setNextReviewDate(LocalDateTime.now());
        }
        return cardRepository.save(card);
    }

    @Transactional
    public Optional<Card> updateCard(Long id, Card cardDetails) {
        return cardRepository.findById(id).map(card -> {
            card.setFront(cardDetails.getFront());
            card.setBack(cardDetails.getBack());
            card.setDeckId(cardDetails.getDeckId());
            return cardRepository.save(card);
        });
    }

    @Transactional
    public boolean deleteCard(Long id) {
        return cardRepository.findById(id).map(card -> {
            cardRepository.delete(card);
            return true;
        }).orElse(false);
    }

    @Transactional
    public Optional<Card> reviewCard(Long cardId, int quality) {
        return cardRepository.findById(cardId).map(card -> {
            SM2Algorithm.ReviewResult result = sm2Algorithm.reviewCard(card, quality);
            Card updatedCard = cardRepository.save(result.getCard());
            reviewLogRepository.save(result.getReviewLog());
            return updatedCard;
        });
    }

    @Transactional
    public List<Card> importCardsFromCsv(Long deckId, java.io.InputStream inputStream) {
        List<Card> importedCards = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",", 2);
                if (parts.length >= 2) {
                    Card card = new Card();
                    card.setDeckId(deckId);
                    card.setFront(parts[0].trim());
                    card.setBack(parts[1].trim());
                    card.setNextReviewDate(LocalDateTime.now());
                    importedCards.add(cardRepository.save(card));
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to import cards from CSV", e);
        }
        return importedCards;
    }
}
