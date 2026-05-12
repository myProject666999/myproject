
package com.beautyhair.controller;

import com.beautyhair.common.PageResult;
import com.beautyhair.common.Result;
import com.beautyhair.entity.ServiceItem;
import com.beautyhair.service.ServiceItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/service")
@RequiredArgsConstructor
public class ServiceItemController {

    private final ServiceItemService serviceItemService;

    @GetMapping("/page")
    public Result<PageResult<ServiceItem>> getServiceItemPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Integer status) {
        PageResult<ServiceItem> result = serviceItemService.getServiceItemPage(page, size, keyword, categoryId, status);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<ServiceItem> getById(@PathVariable Long id) {
        ServiceItem serviceItem = serviceItemService.getById(id);
        return Result.success(serviceItem);
    }

    @GetMapping("/all")
    public Result<List<ServiceItem>> getAll() {
        List<ServiceItem> serviceItems = serviceItemService.getAll();
        return Result.success(serviceItems);
    }

    @PostMapping
    public Result<Void> add(@RequestBody ServiceItem serviceItem) {
        serviceItemService.add(serviceItem);
        return Result.success("新增成功");
    }

    @PutMapping
    public Result<Void> update(@RequestBody ServiceItem serviceItem) {
        serviceItemService.update(serviceItem);
        return Result.success("更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        serviceItemService.delete(id);
        return Result.success("删除成功");
    }
}
