package com.runningroute.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.runningroute.entity.Favorite;
import com.runningroute.entity.Route;
import com.runningroute.mapper.FavoriteMapper;
import com.runningroute.service.FavoriteService;
import com.runningroute.service.RouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FavoriteServiceImpl extends ServiceImpl<FavoriteMapper, Favorite> implements FavoriteService {

    @Autowired
    private RouteService routeService;

    @Override
    public boolean toggleFavorite(Long userId, Long routeId) {
        QueryWrapper<Favorite> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).eq("route_id", routeId);
        Favorite favorite = getOne(wrapper);

        Route route = routeService.getById(routeId);
        if (route == null) {
            return false;
        }

        if (favorite != null) {
            removeById(favorite.getId());
            route.setFavoriteCount(Math.max(0, route.getFavoriteCount() - 1));
        } else {
            Favorite newFavorite = new Favorite();
            newFavorite.setUserId(userId);
            newFavorite.setRouteId(routeId);
            save(newFavorite);
            route.setFavoriteCount(route.getFavoriteCount() + 1);
        }
        routeService.updateById(route);
        return true;
    }

    @Override
    public boolean isFavorited(Long userId, Long routeId) {
        QueryWrapper<Favorite> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).eq("route_id", routeId);
        return count(wrapper) > 0;
    }
}
