package com.chess.controller;

import com.chess.common.Result;
import com.chess.entity.TableInfo;
import com.chess.service.TableInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
@CrossOrigin
public class TableInfoController {

    @Autowired
    private TableInfoService tableInfoService;

    @GetMapping
    public Result<List<TableInfo>> list() {
        return Result.success(tableInfoService.getTableListWithStatus());
    }

    @GetMapping("/{id}")
    public Result<TableInfo> getById(@PathVariable Long id) {
        return Result.success(tableInfoService.getTableById(id));
    }

    @PostMapping
    public Result<Boolean> add(@RequestBody TableInfo table) {
        return Result.success(tableInfoService.save(table));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody TableInfo table) {
        return Result.success(tableInfoService.updateById(table));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(tableInfoService.removeById(id));
    }
}
