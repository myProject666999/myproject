package com.health.appointment.controller;

import com.health.appointment.common.Result;
import com.health.appointment.entity.Department;
import com.health.appointment.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/departments")
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    @GetMapping
    public Result<List<Department>> getAllDepartments() {
        return Result.success(departmentService.getAllDepartments());
    }

    @GetMapping("/{id}")
    public Result<Department> getDepartmentById(@PathVariable Long id) {
        Department department = departmentService.getDepartmentById(id);
        if (department == null) {
            return Result.error("科室不存在");
        }
        return Result.success(department);
    }
}
