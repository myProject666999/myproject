package com.flashcard.service;

import com.flashcard.entity.Deck;
import com.flashcard.repository.DeckRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class DeckService {

    private final DeckRepository deckRepository;

    @Autowired
    public DeckService(DeckRepository deckRepository) {
        this.deckRepository = deckRepository;
    }

    public List<Deck> getAllDecks() {
        return deckRepository.findAll();
    }

    public Optional<Deck> getDeckById(Long id) {
        return deckRepository.findById(id);
    }

    @Transactional
    public Deck createDeck(Deck deck) {
        return deckRepository.save(deck);
    }

    @Transactional
    public Optional<Deck> updateDeck(Long id, Deck deckDetails) {
        return deckRepository.findById(id).map(deck -> {
            deck.setName(deckDetails.getName());
            deck.setDescription(deckDetails.getDescription());
            return deckRepository.save(deck);
        });
    }

    @Transactional
    public boolean deleteDeck(Long id) {
        return deckRepository.findById(id).map(deck -> {
            deckRepository.delete(deck);
            return true;
        }).orElse(false);
    }
}
