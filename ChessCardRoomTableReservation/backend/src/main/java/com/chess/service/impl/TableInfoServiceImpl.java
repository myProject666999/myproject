package com.chess.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.chess.entity.Orders;
import com.chess.entity.TableInfo;
import com.chess.mapper.OrdersMapper;
import com.chess.mapper.TableInfoMapper;
import com.chess.service.TableInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TableInfoServiceImpl extends ServiceImpl<TableInfoMapper, TableInfo> implements TableInfoService {

    @Autowired
    private OrdersMapper ordersMapper;

    @Override
    public List<TableInfo> getTableListWithStatus() {
        List<TableInfo> tables = this.baseMapper.selectListWithType();
        for (TableInfo table : tables) {
            if (table.getStatus() == 1) {
                Orders order = ordersMapper.selectActiveOrderByTableId(table.getId());
                if (order != null) {
                    table.setCurrentOrderId(order.getId());
                    table.setStartTime(order.getStartTime());
                }
            }
        }
        return tables;
    }

    @Override
    public TableInfo getTableById(Long id) {
        return this.getById(id);
    }

    @Override
    public void updateTableStatus(Long tableId, Integer status) {
        TableInfo table = new TableInfo();
        table.setId(tableId);
        table.setStatus(status);
        this.updateById(table);
    }
}
