package com.tcm.system.controller;

import com.tcm.system.config.Result;
import com.tcm.system.entity.DecoctionOrder;
import com.tcm.system.service.DecoctionOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/decoction")
public class DecoctionOrderController {

    @Autowired
    private DecoctionOrderService decoctionOrderService;

    @GetMapping
    public Result<List<DecoctionOrder>> list(@RequestParam(required = false) Integer status) {
        return Result.success(decoctionOrderService.list(status));
    }

    @GetMapping("/{id}")
    public Result<DecoctionOrder> getById(@PathVariable Long id) {
        return Result.success(decoctionOrderService.getById(id));
    }

    @GetMapping("/prescription/{prescriptionId}")
    public Result<DecoctionOrder> getByPrescriptionId(@PathVariable Long prescriptionId) {
        return Result.success(decoctionOrderService.getByPrescriptionId(prescriptionId));
    }

    @PostMapping
    public Result<Boolean> create(@RequestBody DecoctionOrder order) {
        return Result.success(decoctionOrderService.create(order));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody DecoctionOrder order) {
        return Result.success(decoctionOrderService.update(order));
    }

    @PutMapping("/{id}/start")
    public Result<Boolean> start(@PathVariable Long id) {
        return Result.success(decoctionOrderService.start(id));
    }

    @PutMapping("/{id}/complete")
    public Result<Boolean> complete(@PathVariable Long id) {
        return Result.success(decoctionOrderService.complete(id));
    }

    @PutMapping("/{id}/pickup")
    public Result<Boolean> pickup(@PathVariable Long id) {
        return Result.success(decoctionOrderService.pickup(id));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(decoctionOrderService.delete(id));
    }
}
