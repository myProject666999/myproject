package com.reading.notes.service;

import com.reading.notes.entity.Book;
import com.reading.notes.entity.Note;
import com.reading.notes.entity.NoteTag;
import com.reading.notes.entity.Tag;
import com.reading.notes.repository.BookRepository;
import com.reading.notes.repository.NoteRepository;
import com.reading.notes.repository.NoteTagRepository;
import com.reading.notes.repository.TagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NoteService {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private NoteTagRepository noteTagRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private BookRepository bookRepository;

    public List<Note> findAll() {
        List<Note> notes = noteRepository.findAllByOrderByCreatedAtDesc();
        return populateBookTitles(notes);
    }

    public List<Note> findByBookId(Long bookId) {
        List<Note> notes = noteRepository.findByBookIdOrderByCreatedAtDesc(bookId);
        return populateBookTitles(notes);
    }

    public Optional<Note> findById(Long id) {
        return noteRepository.findById(id).map(this::populateBookTitle);
    }

    public List<Note> findFavorites() {
        List<Note> notes = noteRepository.findByIsFavoriteTrueOrderByCreatedAtDesc();
        return populateBookTitles(notes);
    }

    public List<Note> findRandom(int limit) {
        List<Note> notes = noteRepository.findRandomNotes(limit);
        return populateBookTitles(notes);
    }

    public List<Note> findRandomByBookId(Long bookId, int limit) {
        List<Note> notes = noteRepository.findRandomNotesByBookId(bookId, limit);
        return populateBookTitles(notes);
    }

    @Transactional
    public Note save(Note note, List<Long> tagIds) {
        Note saved = noteRepository.save(note);
        if (tagIds != null) {
            for (Long tagId : tagIds) {
                NoteTag noteTag = new NoteTag();
                noteTag.setNoteId(saved.getId());
                noteTag.setTagId(tagId);
                noteTagRepository.save(noteTag);
            }
        }
        return saved;
    }

    @Transactional
    public Note update(Long id, Note note, List<Long> tagIds) {
        Note existing = noteRepository.findById(id).orElseThrow(() -> new RuntimeException("Note not found"));
        existing.setContent(note.getContent());
        existing.setChapter(note.getChapter());
        existing.setPageNumber(note.getPageNumber());
        existing.setHighlightColor(note.getHighlightColor());
        existing.setIsFavorite(note.getIsFavorite());
        Note saved = noteRepository.save(existing);

        noteTagRepository.deleteByNoteId(id);
        if (tagIds != null) {
            for (Long tagId : tagIds) {
                NoteTag noteTag = new NoteTag();
                noteTag.setNoteId(saved.getId());
                noteTag.setTagId(tagId);
                noteTagRepository.save(noteTag);
            }
        }
        return saved;
    }

    @Transactional
    public void delete(Long id) {
        noteTagRepository.deleteByNoteId(id);
        noteRepository.deleteById(id);
    }

    public Note markReviewed(Long id) {
        Note note = noteRepository.findById(id).orElseThrow(() -> new RuntimeException("Note not found"));
        note.setReviewCount(note.getReviewCount() + 1);
        note.setLastReviewedAt(LocalDateTime.now());
        return noteRepository.save(note);
    }

    public List<Tag> getNoteTags(Long noteId) {
        List<NoteTag> noteTags = noteTagRepository.findByNoteId(noteId);
        List<Long> tagIds = noteTags.stream().map(NoteTag::getTagId).collect(Collectors.toList());
        return tagRepository.findAllById(tagIds);
    }

    private Note populateBookTitle(Note note) {
        if (note.getBookId() != null) {
            bookRepository.findById(note.getBookId()).ifPresent(book -> note.setBookTitle(book.getTitle()));
        }
        return note;
    }

    private List<Note> populateBookTitles(List<Note> notes) {
        for (Note note : notes) {
            populateBookTitle(note);
        }
        return notes;
    }
}
