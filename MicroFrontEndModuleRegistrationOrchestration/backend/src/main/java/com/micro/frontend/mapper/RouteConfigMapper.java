package com.micro.frontend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.entity.RouteConfig;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RouteConfigMapper extends BaseMapper<RouteConfig> {

    RouteConfig selectByRoutePath(@Param("routePath") String routePath);

    List<RouteConfig> selectList(PageQueryDTO query);

    List<RouteConfig> selectAll();

    List<RouteConfig> selectMenuTree();

    Long selectCount(PageQueryDTO query);

    int updateSortOrder(@Param("id") Long id, @Param("sortOrder") Integer sortOrder);

    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

    List<RouteConfig> selectByParentId(@Param("parentId") Long parentId);
}
