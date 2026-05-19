package com.notebook.service;

import com.notebook.entity.Section;
import com.notebook.repository.SectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SectionService {

    @Autowired
    private SectionRepository sectionRepository;

    public List<Section> getSectionsByNotebookId(Long notebookId) {
        return sectionRepository.findByNotebookIdAndParentIdIsNullOrderBySortOrderAsc(notebookId);
    }

    public List<Section> getSubSections(Long parentId) {
        return sectionRepository.findByParentIdOrderBySortOrderAsc(parentId);
    }

    public Optional<Section> getSectionById(Long id) {
        return sectionRepository.findById(id);
    }

    public Section createSection(Section section) {
        return sectionRepository.save(section);
    }

    public Section updateSection(Long id, Section sectionDetails) {
        return sectionRepository.findById(id).map(section -> {
            section.setName(sectionDetails.getName());
            section.setParentId(sectionDetails.getParentId());
            return sectionRepository.save(section);
        }).orElseThrow(() -> new RuntimeException("Section not found"));
    }

    public void deleteSection(Long id) {
        sectionRepository.deleteById(id);
    }
}
