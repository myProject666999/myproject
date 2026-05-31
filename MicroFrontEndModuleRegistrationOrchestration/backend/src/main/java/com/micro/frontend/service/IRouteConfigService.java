package com.micro.frontend.service;

import com.micro.frontend.common.PageResult;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.dto.RouteSaveDTO;
import com.micro.frontend.entity.RouteConfig;

import java.util.List;

public interface IRouteConfigService {

    RouteConfig getById(Long id);

    RouteConfig getByRoutePath(String routePath);

    PageResult<RouteConfig> page(PageQueryDTO query);

    List<RouteConfig> list(PageQueryDTO query);

    boolean save(RouteSaveDTO dto);

    boolean update(RouteSaveDTO dto);

    boolean delete(Long id);

    List<RouteConfig> getTree();

    List<RouteConfig> getMenuTree();

    boolean updateSortOrder(Long id, Integer sortOrder);

    boolean updateStatus(Long id, Integer status);
}
