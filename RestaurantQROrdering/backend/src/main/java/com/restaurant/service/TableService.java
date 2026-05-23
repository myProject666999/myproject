package com.restaurant.service;

import com.restaurant.entity.DiningTable;
import java.util.List;

public interface TableService {
    List<DiningTable> getAllTables();
    DiningTable getTableById(Long id);
    DiningTable getTableByNo(String tableNo);
    DiningTable createTable(DiningTable table);
    DiningTable updateTable(Long id, DiningTable table);
    void deleteTable(Long id);
    void bindTable(String tableNo, String sessionId);
    void unbindTable(String sessionId);
    DiningTable getCurrentTable(String sessionId);
}
