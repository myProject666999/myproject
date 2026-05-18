package com.gtd.controller;

import com.gtd.entity.InboxItem;
import com.gtd.service.InboxItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inbox")
@CrossOrigin(origins = "http://localhost:3000")
public class InboxItemController {

    @Autowired
    private InboxItemService inboxItemService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<InboxItem>> getUnprocessedItems(@PathVariable Long userId) {
        return ResponseEntity.ok(inboxItemService.getUnprocessedItems(userId));
    }

    @GetMapping("/user/{userId}/all")
    public ResponseEntity<List<InboxItem>> getAllItems(@PathVariable Long userId) {
        return ResponseEntity.ok(inboxItemService.getAllItems(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InboxItem> getItemById(@PathVariable Long id) {
        return inboxItemService.getItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<InboxItem> createItem(@RequestBody InboxItem item) {
        return ResponseEntity.ok(inboxItemService.createItem(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InboxItem> updateItem(@PathVariable Long id, @RequestBody InboxItem item) {
        item.setId(id);
        return ResponseEntity.ok(inboxItemService.updateItem(item));
    }

    @PutMapping("/{id}/process")
    public ResponseEntity<Void> markAsProcessed(@PathVariable Long id) {
        inboxItemService.markAsProcessed(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/sort")
    public ResponseEntity<Void> updateSortOrder(@RequestBody Map<String, List<Long>> body) {
        List<Long> itemIds = body.get("itemIds");
        inboxItemService.updateSortOrder(itemIds);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        inboxItemService.deleteItem(id);
        return ResponseEntity.ok().build();
    }
}
