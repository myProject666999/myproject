package com.community.gridgovernance.service;

import com.community.gridgovernance.entity.GridInfo;
import com.community.gridgovernance.repository.GridInfoRepository;
import com.community.gridgovernance.util.CacheUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class GridInfoService {

    @Autowired
    private GridInfoRepository gridInfoRepository;

    @Autowired
    private CacheUtil cacheUtil;

    private static final String GRID_CACHE_PREFIX = "grid:info:";
    private static final String GRID_LIST_CACHE_KEY = "grid:list:all";

    @SuppressWarnings("unchecked")
    public List<GridInfo> getAllGrids() {
        Object cached = cacheUtil.get(GRID_LIST_CACHE_KEY);
        if (cached != null) {
            return (List<GridInfo>) cached;
        }
        List<GridInfo> grids = gridInfoRepository.findByStatus(1);
        cacheUtil.set(GRID_LIST_CACHE_KEY, grids, 1, TimeUnit.HOURS);
        return grids;
    }

    public GridInfo getById(Long id) {
        String cacheKey = GRID_CACHE_PREFIX + id;
        Object cached = cacheUtil.get(cacheKey);
        if (cached != null) {
            return (GridInfo) cached;
        }
        GridInfo grid = gridInfoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("网格不存在"));
        cacheUtil.set(cacheKey, grid, 1, TimeUnit.HOURS);
        return grid;
    }

    public GridInfo findGridByLocation(BigDecimal lng, BigDecimal lat) {
        List<GridInfo> grids = gridInfoRepository.findGridByLocation(lng, lat);
        if (grids.isEmpty()) {
            return null;
        }
        return grids.get(0);
    }

    public List<GridInfo> getGridsByAreaName(String areaName) {
        return gridInfoRepository.findByAreaName(areaName);
    }
}
