package com.medication.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.medication.entity.Inventory;
import com.medication.entity.Medicine;
import com.medication.entity.User;
import com.medication.mapper.InventoryMapper;
import com.medication.service.InventoryService;
import com.medication.service.MedicineService;
import com.medication.service.UserService;
import com.medication.vo.InventoryVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryServiceImpl extends ServiceImpl<InventoryMapper, Inventory> implements InventoryService {

    @Autowired
    private MedicineService medicineService;

    @Autowired
    private UserService userService;

    @Override
    public List<InventoryVO> listAll() {
        List<Inventory> inventories = list();
        return convertToVOList(inventories);
    }

    @Override
    public List<InventoryVO> listByUserId(Long userId) {
        List<Inventory> inventories = lambdaQuery()
                .eq(Inventory::getUserId, userId)
                .list();
        return convertToVOList(inventories);
    }

    @Override
    public List<InventoryVO> listLowStock(Long userId) {
        List<Inventory> inventories = lambdaQuery()
                .eq(Inventory::getUserId, userId)
                .apply("quantity <= warning_quantity")
                .list();
        return convertToVOList(inventories);
    }

    private List<InventoryVO> convertToVOList(List<Inventory> inventories) {
        List<InventoryVO> voList = new ArrayList<>();
        for (Inventory inventory : inventories) {
            InventoryVO vo = new InventoryVO();
            vo.setId(inventory.getId());
            vo.setUserId(inventory.getUserId());
            vo.setMedicineId(inventory.getMedicineId());
            vo.setQuantity(inventory.getQuantity());
            vo.setUnit(inventory.getUnit());
            vo.setWarningQuantity(inventory.getWarningQuantity());
            vo.setExpiryDate(inventory.getExpiryDate());
            vo.setBatchNo(inventory.getBatchNo());
            vo.setLowStock(inventory.getQuantity() <= inventory.getWarningQuantity());

            User user = userService.getById(inventory.getUserId());
            if (user != null) {
                vo.setUserName(user.getName());
            }

            Medicine medicine = medicineService.getById(inventory.getMedicineId());
            if (medicine != null) {
                vo.setMedicineName(medicine.getName());
                vo.setSpecification(medicine.getSpecification());
            }

            voList.add(vo);
        }
        return voList;
    }
}
