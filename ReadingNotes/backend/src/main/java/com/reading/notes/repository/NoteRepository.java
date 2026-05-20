package com.reading.notes.repository;

import com.reading.notes.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findByBookIdOrderByCreatedAtDesc(Long bookId);

    List<Note> findAllByOrderByCreatedAtDesc();

    List<Note> findByIsFavoriteTrueOrderByCreatedAtDesc();

    @Query(value = "SELECT * FROM notes ORDER BY RAND() LIMIT ?1", nativeQuery = true)
    List<Note> findRandomNotes(int limit);

    @Query(value = "SELECT * FROM notes WHERE book_id = ?1 ORDER BY RAND() LIMIT ?2", nativeQuery = true)
    List<Note> findRandomNotesByBookId(Long bookId, int limit);
}
