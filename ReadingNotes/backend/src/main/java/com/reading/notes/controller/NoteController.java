package com.reading.notes.controller;

import com.reading.notes.entity.Note;
import com.reading.notes.entity.Tag;
import com.reading.notes.service.NoteService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    private NoteService noteService;

    @GetMapping
    public List<Note> findAll() {
        return noteService.findAll();
    }

    @GetMapping("/book/{bookId}")
    public List<Note> findByBookId(@PathVariable Long bookId) {
        return noteService.findByBookId(bookId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Note> findById(@PathVariable Long id) {
        return noteService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/tags")
    public List<Tag> getNoteTags(@PathVariable Long id) {
        return noteService.getNoteTags(id);
    }

    @GetMapping("/favorites")
    public List<Note> findFavorites() {
        return noteService.findFavorites();
    }

    @GetMapping("/random")
    public List<Note> findRandom(@RequestParam(defaultValue = "5") int limit) {
        return noteService.findRandom(limit);
    }

    @GetMapping("/random/book/{bookId}")
    public List<Note> findRandomByBookId(@PathVariable Long bookId, @RequestParam(defaultValue = "5") int limit) {
        return noteService.findRandomByBookId(bookId, limit);
    }

    @PostMapping
    public Note create(@RequestBody NoteRequest request) {
        return noteService.save(request.getNote(), request.getTagIds());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> update(@PathVariable Long id, @RequestBody NoteRequest request) {
        return ResponseEntity.ok(noteService.update(id, request.getNote(), request.getTagIds()));
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<Note> markReviewed(@PathVariable Long id) {
        return ResponseEntity.ok(noteService.markReviewed(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        noteService.delete(id);
        return ResponseEntity.ok().build();
    }

    @Data
    public static class NoteRequest {
        private Note note;
        private List<Long> tagIds;
    }
}
