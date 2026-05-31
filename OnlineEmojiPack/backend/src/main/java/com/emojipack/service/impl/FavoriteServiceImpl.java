package com.emojipack.service.impl;

import com.emojipack.entity.Favorite;
import com.emojipack.mapper.FavoriteMapper;
import com.emojipack.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteMapper favoriteMapper;

    @Override
    public void toggleFavorite(Long userId, Long materialId, Long collectionId, Integer type) {
        Favorite exist = favoriteMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<Favorite>()
                        .eq("user_id", userId)
                        .eq(type == 1 ? "material_id" : "collection_id", type == 1 ? materialId : collectionId)
        );

        if (exist != null) {
            favoriteMapper.deleteById(exist.getId());
        } else {
            Favorite favorite = new Favorite();
            favorite.setUserId(userId);
            favorite.setMaterialId(type == 1 ? materialId : null);
            favorite.setCollectionId(type == 2 ? collectionId : null);
            favorite.setType(type);
            favorite.setCreateTime(LocalDateTime.now());
            favoriteMapper.insert(favorite);
        }
    }

    @Override
    public boolean isFavorited(Long userId, Long materialId, Long collectionId, Integer type) {
        Favorite exist = favoriteMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<Favorite>()
                        .eq("user_id", userId)
                        .eq(type == 1 ? "material_id" : "collection_id", type == 1 ? materialId : collectionId)
        );
        return exist != null;
    }
}
