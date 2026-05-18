package com.gtd.controller;

import com.gtd.entity.Context;
import com.gtd.service.ContextService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contexts")
@CrossOrigin(origins = "http://localhost:3000")
public class ContextController {

    @Autowired
    private ContextService contextService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Context>> getAllContexts(@PathVariable Long userId) {
        return ResponseEntity.ok(contextService.getAllContexts(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Context> getContextById(@PathVariable Long id) {
        return contextService.getContextById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Context> createContext(@RequestBody Context context) {
        return ResponseEntity.ok(contextService.createContext(context));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Context> updateContext(@PathVariable Long id, @RequestBody Context context) {
        context.setId(id);
        return ResponseEntity.ok(contextService.updateContext(context));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContext(@PathVariable Long id) {
        contextService.deleteContext(id);
        return ResponseEntity.ok().build();
    }
}
