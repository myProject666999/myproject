package com.fishing.reservation.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fishing.reservation.common.Result;
import com.fishing.reservation.entity.Equipment;
import com.fishing.reservation.mapper.EquipmentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    @Autowired
    private EquipmentMapper equipmentMapper;

    @GetMapping("/list")
    public Result<List<Equipment>> list(@RequestParam(required = false) String category) {
        LambdaQueryWrapper<Equipment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Equipment::getStatus, 1);
        if (category != null && !category.isEmpty()) {
            wrapper.eq(Equipment::getCategory, category);
        }
        List<Equipment> list = equipmentMapper.selectList(wrapper);
        return Result.success(list);
    }

    @GetMapping("/categories")
    public Result<List<String>> categories() {
        List<String> categories = equipmentMapper.selectObjs(
            new LambdaQueryWrapper<Equipment>()
                .select(Equipment::getCategory)
                .groupBy(Equipment::getCategory)
        ).stream().map(Object::toString).toList();
        return Result.success(categories);
    }

    @GetMapping("/{id}")
    public Result<Equipment> detail(@PathVariable Long id) {
        Equipment equipment = equipmentMapper.selectById(id);
        if (equipment == null) {
            return Result.error("商品不存在");
        }
        return Result.success(equipment);
    }

    @PostMapping
    public Result<Equipment> create(@RequestBody Equipment equipment) {
        equipment.setStatus(1);
        equipmentMapper.insert(equipment);
        return Result.success("创建成功", equipment);
    }

    @PutMapping("/{id}")
    public Result<Equipment> update(@PathVariable Long id, @RequestBody Equipment equipment) {
        equipment.setId(id);
        equipmentMapper.updateById(equipment);
        return Result.success("更新成功", equipment);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        equipmentMapper.deleteById(id);
        return Result.success(null);
    }
}
