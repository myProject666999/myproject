package com.notebook.controller;

import com.notebook.entity.Page;
import com.notebook.service.PageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pages")
public class PageController {

    @Autowired
    private PageService pageService;

    @GetMapping("/section/{sectionId}")
    public List<Page> getPagesBySectionId(@PathVariable Long sectionId) {
        return pageService.getPagesBySectionId(sectionId);
    }

    @GetMapping("/favorites")
    public List<Page> getFavoritePages() {
        return pageService.getFavoritePages();
    }

    @GetMapping("/search")
    public List<Page> searchPages(@RequestParam String keyword) {
        return pageService.searchPages(keyword);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Page> getPageById(@PathVariable Long id) {
        return pageService.getPageById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Page createPage(@RequestBody Page page) {
        return pageService.createPage(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Page> updatePage(@PathVariable Long id, @RequestBody Page pageDetails) {
        try {
            return ResponseEntity.ok(pageService.updatePage(id, pageDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> moveToRecycleBin(@PathVariable Long id) {
        pageService.moveToRecycleBin(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/favorite")
    public ResponseEntity<Page> toggleFavorite(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(pageService.toggleFavorite(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
