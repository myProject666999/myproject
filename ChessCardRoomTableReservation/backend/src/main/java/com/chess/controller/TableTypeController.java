package com.chess.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chess.common.Result;
import com.chess.entity.TableType;
import com.chess.mapper.TableTypeMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/table-types")
@CrossOrigin
public class TableTypeController {

    @Autowired
    private TableTypeMapper tableTypeMapper;

    @GetMapping
    public Result<List<TableType>> list() {
        LambdaQueryWrapper<TableType> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(TableType::getId);
        return Result.success(tableTypeMapper.selectList(wrapper));
    }

    @GetMapping("/{id}")
    public Result<TableType> getById(@PathVariable Long id) {
        return Result.success(tableTypeMapper.selectById(id));
    }

    @PostMapping
    public Result<Integer> add(@RequestBody TableType tableType) {
        return Result.success(tableTypeMapper.insert(tableType));
    }

    @PutMapping
    public Result<Integer> update(@RequestBody TableType tableType) {
        return Result.success(tableTypeMapper.updateById(tableType));
    }

    @DeleteMapping("/{id}")
    public Result<Integer> delete(@PathVariable Long id) {
        return Result.success(tableTypeMapper.deleteById(id));
    }
}
