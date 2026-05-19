package com.paper.service;

import com.paper.dto.*;
import com.paper.entity.Paper;
import com.paper.entity.Tag;
import com.paper.repository.PaperRepository;
import com.paper.repository.TagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaperService {

    private static final String UPLOAD_DIR = "uploads/papers";

    @Autowired
    private PaperRepository paperRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private PdfMetadataExtractor pdfMetadataExtractor;

    @Autowired
    private BibTeXService bibTeXService;

    public Page<PaperDTO> findAll(String keyword, Long tagId, Pageable pageable) {
        Page<Paper> papers;
        if (tagId != null) {
            if (keyword != null && !keyword.trim().isEmpty()) {
                papers = paperRepository.findByTagIdAndTitleContaining(tagId, keyword.trim(), pageable);
            } else {
                papers = paperRepository.findByTagId(tagId, pageable);
            }
        } else if (keyword != null && !keyword.trim().isEmpty()) {
            papers = paperRepository.search(keyword.trim(), pageable);
        } else {
            papers = paperRepository.findAll(pageable);
        }
        return papers.map(this::convertToDTO);
    }

    public PaperDetailDTO findById(Long id) {
        Paper paper = paperRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("论文不存在"));
        return convertToDetailDTO(paper);
    }

    @Transactional
    public PaperDTO create(PaperRequest request) {
        Paper paper = new Paper();
        updatePaperFromRequest(paper, request);
        paper = paperRepository.save(paper);
        return convertToDTO(paper);
    }

    @Transactional
    public PaperDTO uploadPdf(MultipartFile file) throws IOException {
        Files.createDirectories(Paths.get(UPLOAD_DIR));
        
        PaperRequest extracted = pdfMetadataExtractor.extractMetadata(file);
        
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : ".pdf";
        String storedFileName = UUID.randomUUID() + fileExtension;
        
        Path filePath = Paths.get(UPLOAD_DIR, storedFileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        Paper paper = new Paper();
        paper.setTitle(extracted.getTitle());
        paper.setAuthors(extracted.getAuthors());
        paper.setAbstractText(extracted.getAbstractText());
        paper.setKeywords(extracted.getKeywords());
        paper.setPublicationYear(extracted.getPublicationYear());
        paper.setFilePath(filePath.toString());
        paper.setFileName(originalFilename);
        paper.setFileSize(file.getSize());
        
        paper = paperRepository.save(paper);
        return convertToDTO(paper);
    }

    @Transactional
    public PaperDTO update(Long id, PaperRequest request) {
        Paper paper = paperRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("论文不存在"));
        updatePaperFromRequest(paper, request);
        paper = paperRepository.save(paper);
        return convertToDTO(paper);
    }

    @Transactional
    public void delete(Long id) {
        Paper paper = paperRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("论文不存在"));
        if (paper.getFilePath() != null) {
            try {
                Files.deleteIfExists(Paths.get(paper.getFilePath()));
            } catch (IOException e) {
            }
        }
        paperRepository.delete(paper);
    }

    public String exportBibTeX(Long id) {
        Paper paper = paperRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("论文不存在"));
        return bibTeXService.exportToBibTeX(paper);
    }

    public String exportMultipleBibTeX(List<Long> ids) {
        List<Paper> papers = paperRepository.findByIdIn(ids);
        return bibTeXService.exportMultipleToBibTeX(papers);
    }

    private void updatePaperFromRequest(Paper paper, PaperRequest request) {
        paper.setTitle(request.getTitle());
        paper.setAuthors(request.getAuthors());
        paper.setAbstractText(request.getAbstractText());
        paper.setKeywords(request.getKeywords());
        paper.setPublicationYear(request.getPublicationYear());
        paper.setJournal(request.getJournal());
        paper.setVolume(request.getVolume());
        paper.setIssue(request.getIssue());
        paper.setPages(request.getPages());
        paper.setDoi(request.getDoi());
        
        if (request.getTagIds() != null) {
            List<Tag> tags = tagRepository.findAllById(request.getTagIds());
            paper.setTags(tags);
        }
    }

    private PaperDTO convertToDTO(Paper paper) {
        PaperDTO dto = new PaperDTO();
        dto.setId(paper.getId());
        dto.setTitle(paper.getTitle());
        dto.setAuthors(paper.getAuthors());
        dto.setAbstractText(paper.getAbstractText());
        dto.setKeywords(paper.getKeywords());
        dto.setPublicationYear(paper.getPublicationYear());
        dto.setJournal(paper.getJournal());
        dto.setVolume(paper.getVolume());
        dto.setIssue(paper.getIssue());
        dto.setPages(paper.getPages());
        dto.setDoi(paper.getDoi());
        dto.setFileName(paper.getFileName());
        dto.setFileSize(paper.getFileSize());
        dto.setCreatedAt(paper.getCreatedAt());
        dto.setUpdatedAt(paper.getUpdatedAt());
        
        if (paper.getTags() != null) {
            dto.setTags(paper.getTags().stream()
                    .map(this::convertTagToDTO)
                    .collect(Collectors.toList()));
        }
        
        if (paper.getNotes() != null) {
            dto.setNoteCount(paper.getNotes().size());
        }
        
        return dto;
    }

    private PaperDetailDTO convertToDetailDTO(Paper paper) {
        PaperDetailDTO dto = new PaperDetailDTO();
        dto.setId(paper.getId());
        dto.setTitle(paper.getTitle());
        dto.setAuthors(paper.getAuthors());
        dto.setAbstractText(paper.getAbstractText());
        dto.setKeywords(paper.getKeywords());
        dto.setPublicationYear(paper.getPublicationYear());
        dto.setJournal(paper.getJournal());
        dto.setVolume(paper.getVolume());
        dto.setIssue(paper.getIssue());
        dto.setPages(paper.getPages());
        dto.setDoi(paper.getDoi());
        dto.setFileName(paper.getFileName());
        dto.setFileSize(paper.getFileSize());
        dto.setCreatedAt(paper.getCreatedAt());
        dto.setUpdatedAt(paper.getUpdatedAt());
        
        if (paper.getTags() != null) {
            dto.setTags(paper.getTags().stream()
                    .map(this::convertTagToDTO)
                    .collect(Collectors.toList()));
        }
        
        if (paper.getNotes() != null) {
            dto.setNotes(paper.getNotes().stream()
                    .map(note -> {
                        NoteDTO noteDTO = new NoteDTO();
                        noteDTO.setId(note.getId());
                        noteDTO.setTitle(note.getTitle());
                        noteDTO.setContent(note.getContent());
                        noteDTO.setPageNumber(note.getPageNumber());
                        noteDTO.setCreatedAt(note.getCreatedAt());
                        noteDTO.setUpdatedAt(note.getUpdatedAt());
                        return noteDTO;
                    })
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }

    private TagDTO convertTagToDTO(Tag tag) {
        TagDTO dto = new TagDTO();
        dto.setId(tag.getId());
        dto.setName(tag.getName());
        dto.setColor(tag.getColor());
        return dto;
    }
}
