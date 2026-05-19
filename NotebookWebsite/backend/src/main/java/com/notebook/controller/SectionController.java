package com.notebook.controller;

import com.notebook.entity.Section;
import com.notebook.service.SectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sections")
public class SectionController {

    @Autowired
    private SectionService sectionService;

    @GetMapping("/notebook/{notebookId}")
    public List<Section> getSectionsByNotebookId(@PathVariable Long notebookId) {
        return sectionService.getSectionsByNotebookId(notebookId);
    }

    @GetMapping("/parent/{parentId}")
    public List<Section> getSubSections(@PathVariable Long parentId) {
        return sectionService.getSubSections(parentId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Section> getSectionById(@PathVariable Long id) {
        return sectionService.getSectionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Section createSection(@RequestBody Section section) {
        return sectionService.createSection(section);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Section> updateSection(@PathVariable Long id, @RequestBody Section sectionDetails) {
        try {
            return ResponseEntity.ok(sectionService.updateSection(id, sectionDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
        sectionService.deleteSection(id);
        return ResponseEntity.ok().build();
    }
}
