package com.paper.service;

import com.paper.dto.NoteDTO;
import com.paper.dto.NoteRequest;
import com.paper.entity.Note;
import com.paper.entity.Paper;
import com.paper.repository.NoteRepository;
import com.paper.repository.PaperRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoteService {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private PaperRepository paperRepository;

    public List<NoteDTO> findByPaperId(Long paperId) {
        return noteRepository.findByPaperIdOrderByCreatedAtDesc(paperId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<NoteDTO> findAll() {
        return noteRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public NoteDTO findById(Long id) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("笔记不存在"));
        return convertToDTO(note);
    }

    @Transactional
    public NoteDTO create(NoteRequest request) {
        Paper paper = paperRepository.findById(request.getPaperId())
                .orElseThrow(() -> new RuntimeException("论文不存在"));
        
        Note note = new Note();
        note.setPaper(paper);
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setPageNumber(request.getPageNumber());
        
        note = noteRepository.save(note);
        return convertToDTO(note);
    }

    @Transactional
    public NoteDTO update(Long id, NoteRequest request) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("笔记不存在"));
        
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setPageNumber(request.getPageNumber());
        
        note = noteRepository.save(note);
        return convertToDTO(note);
    }

    @Transactional
    public void delete(Long id) {
        if (!noteRepository.existsById(id)) {
            throw new RuntimeException("笔记不存在");
        }
        noteRepository.deleteById(id);
    }

    private NoteDTO convertToDTO(Note note) {
        NoteDTO dto = new NoteDTO();
        dto.setId(note.getId());
        dto.setPaperId(note.getPaper().getId());
        dto.setPaperTitle(note.getPaper().getTitle());
        dto.setTitle(note.getTitle());
        dto.setContent(note.getContent());
        dto.setPageNumber(note.getPageNumber());
        dto.setCreatedAt(note.getCreatedAt());
        dto.setUpdatedAt(note.getUpdatedAt());
        return dto;
    }
}
