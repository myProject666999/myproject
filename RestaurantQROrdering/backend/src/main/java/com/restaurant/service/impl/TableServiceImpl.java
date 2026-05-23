package com.restaurant.service.impl;

import com.restaurant.entity.DiningTable;
import com.restaurant.repository.TableRepository;
import com.restaurant.service.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class TableServiceImpl implements TableService {
    
    private final TableRepository tableRepository;
    private final StringRedisTemplate redisTemplate;
    
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
        redisTemplate.opsForValue().set(key, table.getId().toString(), expireHours, TimeUnit.HOURS);
    }
    
    @Override
    public void unbindTable(String sessionId) {
        String key = sessionPrefix + sessionId;
        redisTemplate.delete(key);
    }
    
    @Override
    public DiningTable getCurrentTable(String sessionId) {
        String key = sessionPrefix + sessionId;
        String tableIdStr = redisTemplate.opsForValue().get(key);
        if (tableIdStr == null) {
            return null;
        }
        return getTableById(Long.parseLong(tableIdStr));
    }
}
