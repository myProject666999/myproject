package com.recipebook.controller;

import com.recipebook.entity.Favorite;
import com.recipebook.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping("/check/{recipeId}")
    public ResponseEntity<Map<String, Boolean>> isFavorite(@PathVariable Long recipeId) {
        Map<String, Boolean> result = new HashMap<>();
        result.put("isFavorite", favoriteService.isFavorite(recipeId));
        return ResponseEntity.ok(result);
    }

    @PostMapping("/toggle/{recipeId}")
    public ResponseEntity<Map<String, Object>> toggleFavorite(@PathVariable Long recipeId) {
        Favorite fav = favoriteService.toggleFavorite(recipeId);
        Map<String, Object> result = new HashMap<>();
        result.put("isFavorite", fav != null);
        result.put("favorite", fav);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{recipeId}")
    public ResponseEntity<Void> addFavorite(@PathVariable Long recipeId) {
        favoriteService.addFavorite(recipeId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{recipeId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable Long recipeId) {
        favoriteService.removeFavorite(recipeId);
        return ResponseEntity.noContent().build();
    }
}
