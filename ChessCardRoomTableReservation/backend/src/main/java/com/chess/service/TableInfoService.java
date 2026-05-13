package com.chess.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.chess.entity.TableInfo;

import java.util.List;

public interface TableInfoService extends IService<TableInfo> {
    List<TableInfo> getTableListWithStatus();
    TableInfo getTableById(Long id);
    void updateTableStatus(Long tableId, Integer status);
}
