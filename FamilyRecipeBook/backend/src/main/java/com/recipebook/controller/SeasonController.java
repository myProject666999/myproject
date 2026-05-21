package com.recipebook.controller;

import com.recipebook.entity.Season;
import com.recipebook.service.SeasonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seasons")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SeasonController {

    private final SeasonService seasonService;

    @GetMapping
    public ResponseEntity<List<Season>> getAllSeasons() {
        return ResponseEntity.ok(seasonService.getAllSeasons());
    }
}
