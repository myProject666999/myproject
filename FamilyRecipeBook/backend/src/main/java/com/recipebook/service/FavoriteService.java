package com.recipebook.service;

import com.recipebook.entity.Favorite;
import com.recipebook.repository.FavoriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;

    @Transactional(readOnly = true)
    public List<Favorite> getAllFavorites() {
        return favoriteRepository.findAll();
    }

    @Transactional(readOnly = true)
    public boolean isFavorite(Long recipeId) {
        return favoriteRepository.existsByRecipeId(recipeId);
    }

    @Transactional
    public Favorite toggleFavorite(Long recipeId) {
        if (favoriteRepository.existsByRecipeId(recipeId)) {
            favoriteRepository.deleteByRecipeId(recipeId);
            return null;
        } else {
            Favorite fav = new Favorite();
            fav.setRecipeId(recipeId);
            return favoriteRepository.save(fav);
        }
    }

    @Transactional
    public void addFavorite(Long recipeId) {
        if (!favoriteRepository.existsByRecipeId(recipeId)) {
            Favorite fav = new Favorite();
            fav.setRecipeId(recipeId);
            favoriteRepository.save(fav);
        }
    }

    @Transactional
    public void removeFavorite(Long recipeId) {
        favoriteRepository.deleteByRecipeId(recipeId);
    }
}
