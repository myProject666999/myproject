package com.travel.controller;

import com.travel.entity.Attraction;
import com.travel.service.AttractionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/attractions")
@CrossOrigin(origins = "*")
public class AttractionController {

    @Autowired
    private AttractionService attractionService;

    @GetMapping("/schedule/{scheduleId}")
    public List<Attraction> findByDailyScheduleId(@PathVariable Long scheduleId) {
        return attractionService.findByDailyScheduleId(scheduleId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Attraction> findById(@PathVariable Long id) {
        return attractionService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Attraction create(@RequestBody Attraction attraction) {
        return attractionService.save(attraction);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Attraction> update(@PathVariable Long id, @RequestBody Attraction attraction) {
        return attractionService.findById(id)
                .map(existing -> {
                    attraction.setId(id);
                    return ResponseEntity.ok(attractionService.save(attraction));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return attractionService.findById(id)
                .map(attraction -> {
                    attractionService.deleteById(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
