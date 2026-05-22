package com.medication.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.medication.entity.Inventory;
import com.medication.vo.InventoryVO;
import java.util.List;

public interface InventoryService extends IService<Inventory> {
    List<InventoryVO> listAll();
    List<InventoryVO> listByUserId(Long userId);
    List<InventoryVO> listLowStock(Long userId);
}
