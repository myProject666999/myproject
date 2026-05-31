package com.emojipack.service;

import com.emojipack.entity.Favorite;

public interface FavoriteService {

    void toggleFavorite(Long userId, Long materialId, Long collectionId, Integer type);

    boolean isFavorited(Long userId, Long materialId, Long collectionId, Integer type);
}
