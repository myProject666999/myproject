package com.runningroute.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.runningroute.entity.Favorite;

public interface FavoriteService extends IService<Favorite> {
    boolean toggleFavorite(Long userId, Long routeId);
    boolean isFavorited(Long userId, Long routeId);
}
