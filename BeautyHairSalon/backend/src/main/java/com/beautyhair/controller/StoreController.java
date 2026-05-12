
package com.beautyhair.controller;

import com.beautyhair.common.PageResult;
import com.beautyhair.common.Result;
import com.beautyhair.entity.Store;
import com.beautyhair.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/store")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    @GetMapping("/page")
    public Result<PageResult<Store>> getStorePage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status) {
        PageResult<Store> result = storeService.getStorePage(page, size, keyword, status);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<Store> getById(@PathVariable Long id) {
        Store store = storeService.getById(id);
        return Result.success(store);
    }

    @GetMapping("/all")
    public Result<List<Store>> getAll() {
        List<Store> stores = storeService.getAll();
        return Result.success(stores);
    }

    @PostMapping
    public Result<Void> add(@RequestBody Store store) {
        storeService.add(store);
        return Result.success("新增成功");
    }

    @PutMapping
    public Result<Void> update(@RequestBody Store store) {
        storeService.update(store);
        return Result.success("更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        storeService.delete(id);
        return Result.success("删除成功");
    }
}
