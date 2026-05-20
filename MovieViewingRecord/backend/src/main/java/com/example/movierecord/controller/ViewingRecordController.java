package com.example.movierecord.controller;

import com.example.movierecord.entity.ViewingRecord;
import com.example.movierecord.service.ViewingRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/records")
public class ViewingRecordController {

    @Autowired
    private ViewingRecordService viewingRecordService;

    private static final Long DEFAULT_USER_ID = 1L;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getUserRecords(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<ViewingRecord> recordPage = viewingRecordService.getUserRecords(
                DEFAULT_USER_ID, status, keyword, page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("content", recordPage.getContent());
        response.put("totalElements", recordPage.getTotalElements());
        response.put("totalPages", recordPage.getTotalPages());
        response.put("currentPage", recordPage.getNumber());
        response.put("pageSize", recordPage.getSize());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ViewingRecord> getRecordById(@PathVariable Long id) {
        return viewingRecordService.getRecordById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<ViewingRecord> getRecordByMovieId(@PathVariable Long movieId) {
        return viewingRecordService.getRecordByUserAndMovie(DEFAULT_USER_ID, movieId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/years")
    public ResponseEntity<List<Integer>> getWatchYears() {
        return ResponseEntity.ok(viewingRecordService.getWatchYears(DEFAULT_USER_ID));
    }

    @PostMapping
    public ResponseEntity<ViewingRecord> createRecord(@RequestBody ViewingRecord record) {
        record.setUserId(DEFAULT_USER_ID);
        ViewingRecord saved = viewingRecordService.saveRecord(record);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ViewingRecord> updateRecord(@PathVariable Long id, @RequestBody ViewingRecord record) {
        return viewingRecordService.getRecordById(id)
                .map(existing -> {
                    record.setId(id);
                    record.setUserId(DEFAULT_USER_ID);
                    ViewingRecord updated = viewingRecordService.saveRecord(record);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecord(@PathVariable Long id) {
        if (viewingRecordService.getRecordById(id).isPresent()) {
            viewingRecordService.deleteRecord(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
