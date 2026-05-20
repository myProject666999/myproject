package com.flashcard.controller;

import com.flashcard.entity.Deck;
import com.flashcard.service.DeckService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/decks")
@CrossOrigin(origins = "http://localhost:8081")
public class DeckController {

    private final DeckService deckService;

    @Autowired
    public DeckController(DeckService deckService) {
        this.deckService = deckService;
    }

    @GetMapping
    public List<Deck> getAllDecks() {
        return deckService.getAllDecks();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Deck> getDeckById(@PathVariable Long id) {
        return deckService.getDeckById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Deck createDeck(@RequestBody Deck deck) {
        return deckService.createDeck(deck);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Deck> updateDeck(@PathVariable Long id, @RequestBody Deck deckDetails) {
        return deckService.updateDeck(id, deckDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeck(@PathVariable Long id) {
        if (deckService.deleteDeck(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
