package com.flashcard.controller;

import com.flashcard.entity.Card;
import com.flashcard.service.CardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cards")
@CrossOrigin(origins = "http://localhost:8081")
public class CardController {

    private final CardService cardService;

    @Autowired
    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    @GetMapping
    public List<Card> getAllCards() {
        return cardService.getAllCards();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Card> getCardById(@PathVariable Long id) {
        return cardService.getCardById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/deck/{deckId}")
    public List<Card> getCardsByDeckId(@PathVariable Long deckId) {
        return cardService.getCardsByDeckId(deckId);
    }

    @GetMapping("/due")
    public List<Card> getDueCards() {
        return cardService.getDueCards();
    }

    @GetMapping("/due/deck/{deckId}")
    public List<Card> getDueCardsByDeckId(@PathVariable Long deckId) {
        return cardService.getDueCardsByDeckId(deckId);
    }

    @GetMapping("/due/count")
    public long countDueCards() {
        return cardService.countDueCards();
    }

    @PostMapping
    public Card createCard(@RequestBody Card card) {
        return cardService.createCard(card);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Card> updateCard(@PathVariable Long id, @RequestBody Card cardDetails) {
        return cardService.updateCard(id, cardDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCard(@PathVariable Long id) {
        if (cardService.deleteCard(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<Card> reviewCard(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        Integer quality = request.get("quality");
        if (quality == null) {
            return ResponseEntity.badRequest().build();
        }
        return cardService.reviewCard(id, quality)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/import/{deckId}")
    public ResponseEntity<List<Card>> importCards(@PathVariable Long deckId, @RequestParam("file") MultipartFile file) {
        try {
            List<Card> importedCards = cardService.importCardsFromCsv(deckId, file.getInputStream());
            return ResponseEntity.ok(importedCards);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
