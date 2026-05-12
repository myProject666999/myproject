package com.tcm.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tcm.system.entity.HerbInventory;
import com.tcm.system.repository.HerbInventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HerbInventoryService {

    @Autowired
    private HerbInventoryRepository inventoryRepository;

    public List<HerbInventory> list(Long herbId) {
        LambdaQueryWrapper<HerbInventory> wrapper = new LambdaQueryWrapper<>();
        if (herbId != null) {
            wrapper.eq(HerbInventory::getHerbId, herbId);
        }
        wrapper.orderByDesc(HerbInventory::getCreateTime);
        return inventoryRepository.selectList(wrapper);
    }

    public HerbInventory getById(Long id) {
        return inventoryRepository.selectById(id);
    }

    public boolean save(HerbInventory inventory) {
        return inventoryRepository.insert(inventory) > 0;
    }

    public boolean update(HerbInventory inventory) {
        return inventoryRepository.updateById(inventory) > 0;
    }

    public boolean delete(Long id) {
        return inventoryRepository.deleteById(id) > 0;
    }
}
