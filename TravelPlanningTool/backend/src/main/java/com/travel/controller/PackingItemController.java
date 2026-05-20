package com.travel.controller;

import com.travel.entity.PackingItem;
import com.travel.service.PackingItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/packing-items")
public class PackingItemController {

    @Autowired
    private PackingItemService packingItemService;

    @GetMapping("/trip/{tripId}")
    public List<PackingItem> findByTripId(@PathVariable Long tripId) {
        return packingItemService.findByTripId(tripId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PackingItem> findById(@PathVariable Long id) {
        return packingItemService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public PackingItem create(@RequestBody PackingItem packingItem) {
        return packingItemService.save(packingItem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PackingItem> update(@PathVariable Long id, @RequestBody PackingItem packingItem) {
        return packingItemService.findById(id)
                .map(existing -> {
                    packingItem.setId(id);
                    return ResponseEntity.ok(packingItemService.save(packingItem));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return packingItemService.findById(id)
                .map(item -> {
                    packingItemService.deleteById(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
