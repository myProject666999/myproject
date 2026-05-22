package com.medication.controller;

import com.medication.common.Result;
import com.medication.entity.Medicine;
import com.medication.service.MedicineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/medicines")
public class MedicineController {

    @Autowired
    private MedicineService medicineService;

    @GetMapping
    public Result<List<Medicine>> list() {
        return Result.success(medicineService.listAll());
    }

    @GetMapping("/{id}")
    public Result<Medicine> getById(@PathVariable Long id) {
        return Result.success(medicineService.getById(id));
    }

    @PostMapping
    public Result<Medicine> save(@RequestBody Medicine medicine) {
        medicineService.save(medicine);
        return Result.success(medicine);
    }

    @PutMapping
    public Result<Medicine> update(@RequestBody Medicine medicine) {
        medicineService.updateById(medicine);
        return Result.success(medicine);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        medicineService.removeById(id);
        return Result.success();
    }
}
