package com.runningroute.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.runningroute.entity.Route;
import com.runningroute.mapper.RouteMapper;
import com.runningroute.service.RouteService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RouteServiceImpl extends ServiceImpl<RouteMapper, Route> implements RouteService {

    @Override
    public Page<Route> getRouteList(int page, int size, String keyword, Integer difficulty) {
        Page<Route> pageParam = new Page<>(page, size);
        QueryWrapper<Route> wrapper = new QueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like("name", keyword);
        }
        if (difficulty != null) {
            wrapper.eq("difficulty", difficulty);
        }
        wrapper.orderByDesc("create_time");
        return page(pageParam, wrapper);
    }

    @Override
    public Route getRouteDetail(Long id) {
        Route route = getById(id);
        if (route != null) {
            route.setViewCount(route.getViewCount() + 1);
            updateById(route);
        }
        return route;
    }

    @Override
    public boolean saveRoute(Route route) {
        return saveOrUpdate(route);
    }

    @Override
    public List<Route> getFavoriteRoutes(Long userId) {
        QueryWrapper<Route> wrapper = new QueryWrapper<>();
        wrapper.inSql("id", "SELECT route_id FROM favorite WHERE user_id = " + userId);
        wrapper.orderByDesc("create_time");
        return list(wrapper);
    }
}
