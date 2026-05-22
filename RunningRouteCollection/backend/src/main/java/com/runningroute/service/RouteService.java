package com.runningroute.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.runningroute.entity.Route;

import java.util.List;

public interface RouteService extends IService<Route> {
    Page<Route> getRouteList(int page, int size, String keyword, Integer difficulty);
    Route getRouteDetail(Long id);
    boolean saveRoute(Route route);
    List<Route> getFavoriteRoutes(Long userId);
}
