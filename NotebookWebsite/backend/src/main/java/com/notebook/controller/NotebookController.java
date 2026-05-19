package com.notebook.controller;

import com.notebook.entity.Notebook;
import com.notebook.service.NotebookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notebooks")
public class NotebookController {

    @Autowired
    private NotebookService notebookService;

    @GetMapping
    public List<Notebook> getAllNotebooks() {
        return notebookService.getAllNotebooks();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Notebook> getNotebookById(@PathVariable Long id) {
        return notebookService.getNotebookById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Notebook createNotebook(@RequestBody Notebook notebook) {
        return notebookService.createNotebook(notebook);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Notebook> updateNotebook(@PathVariable Long id, @RequestBody Notebook notebookDetails) {
        try {
            return ResponseEntity.ok(notebookService.updateNotebook(id, notebookDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotebook(@PathVariable Long id) {
        notebookService.deleteNotebook(id);
        return ResponseEntity.ok().build();
    }
}
