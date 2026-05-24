package com.example.complaint.service;

import com.example.complaint.dto.StatisticsDTO;
import com.example.complaint.entity.Complaint;
import com.example.complaint.entity.ComplaintCategory;
import com.example.complaint.enums.ComplaintStatus;
import com.example.complaint.repository.ComplaintCategoryRepository;
import com.example.complaint.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintCategoryRepository categoryRepository;

    public StatisticsDTO getStatistics() {
        StatisticsDTO dto = new StatisticsDTO();

        List<Complaint> all = complaintRepository.findAll();
        dto.setTotalCount((long) all.size());

        Map<ComplaintStatus, Long> statusCount = all.stream()
                .collect(Collectors.groupingBy(Complaint::getStatus, Collectors.counting()));

        dto.setPendingCount(statusCount.getOrDefault(ComplaintStatus.PENDING, 0L));
        dto.setProcessingCount(statusCount.getOrDefault(ComplaintStatus.PROCESSING, 0L));
        dto.setCompletedCount(statusCount.getOrDefault(ComplaintStatus.COMPLETED, 0L)
                + statusCount.getOrDefault(ComplaintStatus.REPLIED, 0L));

        Double avgRating = all.stream()
                .filter(c -> c.getRating() != null)
                .mapToInt(Complaint::getRating)
                .average()
                .orElse(0.0);
        dto.setAvgRating(Math.round(avgRating * 100) / 100.0);

        Map<Long, String> categoryNameMap = new HashMap<>();
        for (ComplaintCategory c : categoryRepository.findAll()) {
            categoryNameMap.put(c.getId(), c.getName());
        }

        Map<Long, Long> categoryCount = all.stream()
                .collect(Collectors.groupingBy(Complaint::getCategoryId, Collectors.counting()));

        List<StatisticsDTO.CategoryStat> categoryStats = new ArrayList<>();
        for (Map.Entry<Long, Long> e : categoryCount.entrySet()) {
            String name = categoryNameMap.getOrDefault(e.getKey(), "未知分类");
            categoryStats.add(new StatisticsDTO.CategoryStat(name, e.getValue()));
        }
        categoryStats.sort((a, b) -> Long.compare(b.getCount(), a.getCount()));
        dto.setCategoryStats(categoryStats);

        Map<String, Long> areaCount = all.stream()
                .filter(c -> c.getArea() != null && !c.getArea().isBlank())
                .collect(Collectors.groupingBy(Complaint::getArea, Collectors.counting()));

        List<StatisticsDTO.AreaStat> areaStats = new ArrayList<>();
        for (Map.Entry<String, Long> e : areaCount.entrySet()) {
            areaStats.add(new StatisticsDTO.AreaStat(e.getKey(), e.getValue()));
        }
        areaStats.sort((a, b) -> Long.compare(b.getCount(), a.getCount()));
        dto.setAreaStats(areaStats);

        return dto;
    }
}
