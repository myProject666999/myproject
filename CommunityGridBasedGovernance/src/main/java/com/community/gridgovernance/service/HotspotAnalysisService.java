package com.community.gridgovernance.service;

import com.community.gridgovernance.entity.GridInfo;
import com.community.gridgovernance.entity.WorkOrderHotspot;
import com.community.gridgovernance.repository.WorkOrderHotspotRepository;
import com.community.gridgovernance.repository.WorkOrderRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class HotspotAnalysisService {

    @Autowired
    private WorkOrderRepository workOrderRepository;

    @Autowired
    private WorkOrderHotspotRepository hotspotRepository;

    @Autowired
    private GridInfoService gridInfoService;

    public List<Map<String, Object>> getTodayHotspotData() {
        List<Object[]> rawData = workOrderRepository.getTodayHotspotData();
        return convertToHotspotMap(rawData);
    }

    public List<Map<String, Object>> getAllTimeHotspotData() {
        List<Object[]> rawData = workOrderRepository.getAllTimeHotspotData();
        return convertToHotspotMap(rawData);
    }

    public List<Map<String, Object>> getHotspotByGridAndDate(Long gridId, LocalDate date) {
        List<WorkOrderHotspot> hotspots = hotspotRepository.findByStatDateOrderByTotalCountDesc(date);
        List<Map<String, Object>> result = new ArrayList<>();
        for (WorkOrderHotspot hotspot : hotspots) {
            if (gridId == null || hotspot.getGridId().equals(gridId)) {
                result.add(convertHotspotToMap(hotspot));
            }
        }
        return result;
    }

    public List<Map<String, Object>> getHotspotByArea(String areaName, LocalDate date) {
        List<WorkOrderHotspot> hotspots = hotspotRepository.findByAreaNameAndStatDate(areaName, date);
        List<Map<String, Object>> result = new ArrayList<>();
        for (WorkOrderHotspot hotspot : hotspots) {
            result.add(convertHotspotToMap(hotspot));
        }
        return result;
    }

    public void generateDailyHotspotStat() {
        LocalDate statDate = LocalDate.now().minusDays(1);
        List<Object[]> rawData = workOrderRepository.getTodayHotspotData();

        for (Object[] row : rawData) {
            if (row[0] == null) continue;

            Long gridId = ((Number) row[0]).longValue();
            String gridName = (String) row[1];
            String areaName = (String) row[2];
            String orderType = (String) row[3];
            int totalCount = ((Number) row[4]).intValue();
            int pendingCount = ((Number) row[5]).intValue();
            int processingCount = ((Number) row[6]).intValue();
            int completedCount = ((Number) row[7]).intValue();
            int overdueCount = ((Number) row[8]).intValue();

            WorkOrderHotspot hotspot = hotspotRepository
                    .findByGridIdAndOrderTypeAndStatDate(gridId, orderType, statDate)
                    .orElse(new WorkOrderHotspot());

            hotspot.setGridId(gridId);
            hotspot.setGridName(gridName);
            hotspot.setAreaName(areaName);
            hotspot.setOrderType(orderType);
            hotspot.setTotalCount(totalCount);
            hotspot.setPendingCount(pendingCount);
            hotspot.setProcessingCount(processingCount);
            hotspot.setCompletedCount(completedCount);
            hotspot.setOverdueCount(overdueCount);
            hotspot.setStatDate(statDate);

            hotspotRepository.save(hotspot);
        }

        log.info("热点统计数据生成完成，统计日期：{}", statDate);
    }

    private List<Map<String, Object>> convertToHotspotMap(List<Object[]> rawData) {
        List<Map<String, Object>> result = new ArrayList<>();
        Map<Long, Map<String, Object>> gridMap = new HashMap<>();

        for (Object[] row : rawData) {
            if (row[0] == null) continue;

            Long gridId = ((Number) row[0]).longValue();
            String gridName = (String) row[1];
            String areaName = (String) row[2];
            String orderType = (String) row[3];
            int totalCount = ((Number) row[4]).intValue();
            int pendingCount = ((Number) row[5]).intValue();
            int processingCount = ((Number) row[6]).intValue();
            int completedCount = ((Number) row[7]).intValue();
            int overdueCount = ((Number) row[8]).intValue();

            if (!gridMap.containsKey(gridId)) {
                Map<String, Object> gridData = new HashMap<>();
                GridInfo grid = gridInfoService.getById(gridId);
                gridData.put("gridId", gridId);
                gridData.put("gridName", gridName);
                gridData.put("areaName", areaName);
                gridData.put("centerLng", grid != null ? grid.getCenterLng() : BigDecimal.ZERO);
                gridData.put("centerLat", grid != null ? grid.getCenterLat() : BigDecimal.ZERO);
                gridData.put("totalCount", 0);
                gridData.put("pendingCount", 0);
                gridData.put("processingCount", 0);
                gridData.put("completedCount", 0);
                gridData.put("overdueCount", 0);
                gridData.put("typeDetail", new ArrayList<Map<String, Object>>());
                gridMap.put(gridId, gridData);
            }

            Map<String, Object> gridData = gridMap.get(gridId);
            gridData.put("totalCount", (Integer) gridData.get("totalCount") + totalCount);
            gridData.put("pendingCount", (Integer) gridData.get("pendingCount") + pendingCount);
            gridData.put("processingCount", (Integer) gridData.get("processingCount") + processingCount);
            gridData.put("completedCount", (Integer) gridData.get("completedCount") + completedCount);
            gridData.put("overdueCount", (Integer) gridData.get("overdueCount") + overdueCount);

            Map<String, Object> typeDetail = new HashMap<>();
            typeDetail.put("orderType", orderType);
            typeDetail.put("totalCount", totalCount);
            typeDetail.put("pendingCount", pendingCount);
            typeDetail.put("processingCount", processingCount);
            typeDetail.put("completedCount", completedCount);
            typeDetail.put("overdueCount", overdueCount);
            ((List<Map<String, Object>>) gridData.get("typeDetail")).add(typeDetail);
        }

        result.addAll(gridMap.values());
        result.sort((a, b) -> (Integer) b.get("totalCount") - (Integer) a.get("totalCount"));

        return result;
    }

    private Map<String, Object> convertHotspotToMap(WorkOrderHotspot hotspot) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", hotspot.getId());
        map.put("gridId", hotspot.getGridId());
        map.put("gridName", hotspot.getGridName());
        map.put("areaName", hotspot.getAreaName());
        map.put("orderType", hotspot.getOrderType());
        map.put("totalCount", hotspot.getTotalCount());
        map.put("pendingCount", hotspot.getPendingCount());
        map.put("processingCount", hotspot.getProcessingCount());
        map.put("completedCount", hotspot.getCompletedCount());
        map.put("overdueCount", hotspot.getOverdueCount());
        map.put("avgProcessHours", hotspot.getAvgProcessHours());
        map.put("avgScore", hotspot.getAvgScore());
        map.put("statDate", hotspot.getStatDate());
        return map;
    }
}
