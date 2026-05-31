package com.micro.frontend.service.impl;

import com.micro.frontend.common.PageResult;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.dto.RouteSaveDTO;
import com.micro.frontend.entity.RouteConfig;
import com.micro.frontend.mapper.RouteConfigMapper;
import com.micro.frontend.service.IRouteConfigService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RouteConfigServiceImpl implements IRouteConfigService {

    @Autowired
    private RouteConfigMapper routeConfigMapper;

    @Override
    public RouteConfig getById(Long id) {
        return routeConfigMapper.selectById(id);
    }

    @Override
    public RouteConfig getByRoutePath(String routePath) {
        return routeConfigMapper.selectByRoutePath(routePath);
    }

    @Override
    public PageResult<RouteConfig> page(PageQueryDTO query) {
        List<RouteConfig> list = routeConfigMapper.selectList(query);
        Long total = routeConfigMapper.selectCount(query);
        return PageResult.of(list, total, query.getPageNum(), query.getPageSize());
    }

    @Override
    public List<RouteConfig> list(PageQueryDTO query) {
        return routeConfigMapper.selectList(query);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean save(RouteSaveDTO dto) {
        RouteConfig exist = routeConfigMapper.selectByRoutePath(dto.getRoutePath());
        if (exist != null) {
            throw new RuntimeException("路由路径已存在");
        }
        RouteConfig route = new RouteConfig();
        BeanUtils.copyProperties(dto, route);
        route.setCreatedAt(LocalDateTime.now());
        route.setUpdatedAt(LocalDateTime.now());
        route.setDeleted(0);
        return routeConfigMapper.insert(route) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean update(RouteSaveDTO dto) {
        RouteConfig route = routeConfigMapper.selectById(dto.getId());
        if (route == null) {
            throw new RuntimeException("路由不存在");
        }
        if (!route.getRoutePath().equals(dto.getRoutePath())) {
            RouteConfig exist = routeConfigMapper.selectByRoutePath(dto.getRoutePath());
            if (exist != null) {
                throw new RuntimeException("路由路径已存在");
            }
        }
        BeanUtils.copyProperties(dto, route);
        route.setUpdatedAt(LocalDateTime.now());
        return routeConfigMapper.updateById(route) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean delete(Long id) {
        List<RouteConfig> children = routeConfigMapper.selectByParentId(id);
        if (!children.isEmpty()) {
            throw new RuntimeException("存在子路由，无法删除");
        }
        return routeConfigMapper.deleteById(id) > 0;
    }

    @Override
    public List<RouteConfig> getTree() {
        List<RouteConfig> allRoutes = routeConfigMapper.selectAll();
        return buildTree(allRoutes, 0L);
    }

    @Override
    public List<RouteConfig> getMenuTree() {
        List<RouteConfig> menuRoutes = routeConfigMapper.selectMenuTree();
        return buildTree(menuRoutes, 0L);
    }

    private List<RouteConfig> buildTree(List<RouteConfig> routes, Long parentId) {
        Map<Long, List<RouteConfig>> parentMap = routes.stream()
                .collect(Collectors.groupingBy(RouteConfig::getParentId));

        List<RouteConfig> rootRoutes = routes.stream()
                .filter(r -> parentId.equals(r.getParentId()))
                .collect(Collectors.toList());

        setChildren(rootRoutes, parentMap);
        return rootRoutes;
    }

    private void setChildren(List<RouteConfig> routes, Map<Long, List<RouteConfig>> parentMap) {
        for (RouteConfig route : routes) {
            List<RouteConfig> children = parentMap.getOrDefault(route.getId(), new ArrayList<>());
            if (!children.isEmpty()) {
                route.setChildren(children);
                setChildren(children, parentMap);
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateSortOrder(Long id, Integer sortOrder) {
        return routeConfigMapper.updateSortOrder(id, sortOrder) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateStatus(Long id, Integer status) {
        return routeConfigMapper.updateStatus(id, status) > 0;
    }
}
