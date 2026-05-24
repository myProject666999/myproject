package com.restaurant.service.impl;

import com.restaurant.entity.DiningTable;
import com.restaurant.repository.TableRepository;
import com.restaurant.service.TableService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class TableServiceImpl implements TableService {
    
    private final TableRepository tableRepository;
    private final StringRedisTemplate redisTemplate;
    
    private final Map<String, Long> fallbackTableStore = new ConcurrentHashMap<>();
    
    @Value("${app.table.session-prefix}")
    private String sessionPrefix;
    
    @Value("${app.table.expire-hours}")
    private Integer expireHours;
    
    @Override
    public List<DiningTable> getAllTables() {
        return tableRepository.findAll();
    }
    
    @Override
    public DiningTable getTableById(Long id) {
        return tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("桌台不存在"));
    }
    
    @Override
    public DiningTable getTableByNo(String tableNo) {
        return tableRepository.findByTableNo(tableNo)
                .orElseThrow(() -> new RuntimeException("桌台不存在"));
    }
    
    @Override
    @Transactional
    public DiningTable createTable(DiningTable table) {
        if (tableRepository.findByTableNo(table.getTableNo()).isPresent()) {
            throw new RuntimeException("桌台号已存在");
        }
        return tableRepository.save(table);
    }
    
    @Override
    @Transactional
    public DiningTable updateTable(Long id, DiningTable table) {
        DiningTable existing = getTableById(id);
        existing.setTableNo(table.getTableNo());
        existing.setSeats(table.getSeats());
        existing.setStatus(table.getStatus());
        existing.setRemark(table.getRemark());
        return tableRepository.save(existing);
    }
    
    @Override
    @Transactional
    public void deleteTable(Long id) {
        tableRepository.deleteById(id);
    }
    
    @Override
    public void bindTable(String tableNo, String sessionId) {
        DiningTable table = getTableByNo(tableNo);
        String key = sessionPrefix + sessionId;
        try {
            redisTemplate.opsForValue().set(key, table.getId().toString(), expireHours, TimeUnit.HOURS);
        } catch (Exception e) {
            log.warn("Redis保存桌台失败，使用内存缓存: {}", e.getMessage());
        }
        fallbackTableStore.put(key, table.getId());
    }
    
    @Override
    public void unbindTable(String sessionId) {
        String key = sessionPrefix + sessionId;
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.warn("Redis删除桌台失败，使用内存缓存: {}", e.getMessage());
        }
        fallbackTableStore.remove(key);
    }
    
    @Override
    public DiningTable getCurrentTable(String sessionId) {
        String key = sessionPrefix + sessionId;
        Long tableId = null;
        
        try {
            String tableIdStr = redisTemplate.opsForValue().get(key);
            if (tableIdStr != null) {
                tableId = Long.parseLong(tableIdStr);
            }
        } catch (Exception e) {
            log.warn("Redis读取桌台失败，使用内存缓存: {}", e.getMessage());
            tableId = fallbackTableStore.get(key);
        }
        
        if (tableId == null) {
            tableId = fallbackTableStore.get(key);
        }
        
        if (tableId == null) {
            return null;
        }
        return getTableById(tableId);
    }
}
