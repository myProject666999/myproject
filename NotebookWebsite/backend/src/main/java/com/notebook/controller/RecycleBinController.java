package com.notebook.controller;

import com.notebook.entity.Page;
import com.notebook.entity.RecycleBin;
import com.notebook.service.RecycleBinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recycle-bin")
public class RecycleBinController {

    @Autowired
    private RecycleBinService recycleBinService;

    @GetMapping
    public List<RecycleBin> getAllDeletedPages() {
        return recycleBinService.getAllDeletedPages();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecycleBin> getById(@PathVariable Long id) {
        return recycleBinService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<Page> restorePage(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(recycleBinService.restorePage(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> permanentDelete(@PathVariable Long id) {
        recycleBinService.permanentDelete(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearAll() {
        recycleBinService.clearAll();
        return ResponseEntity.ok().build();
    }
}
