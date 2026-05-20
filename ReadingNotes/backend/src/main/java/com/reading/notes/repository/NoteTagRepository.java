package com.reading.notes.repository;

import com.reading.notes.entity.NoteTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteTagRepository extends JpaRepository<NoteTag, Long> {

    List<NoteTag> findByNoteId(Long noteId);

    List<NoteTag> findByTagId(Long tagId);

    void deleteByNoteIdAndTagId(Long noteId, Long tagId);

    void deleteByNoteId(Long noteId);
}
