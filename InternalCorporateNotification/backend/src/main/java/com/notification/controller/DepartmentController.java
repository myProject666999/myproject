package com.notification.controller;

import com.notification.common.Result;
import com.notification.entity.Department;
import com.notification.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    @GetMapping("/tree")
    public Result<List<Department>> getTree() {
        return Result.success(departmentService.getDepartmentTree());
    }

    @GetMapping
    public Result<List<Department>> getAll() {
        return Result.success(departmentService.list());
    }

    @PostMapping
    public Result<?> add(@RequestBody Department department) {
        departmentService.save(department);
        return Result.success("添加成功");
    }

    @PutMapping("/{id}")
    public Result<?> update(@PathVariable Long id, @RequestBody Department department) {
        department.setId(id);
        departmentService.updateById(department);
        return Result.success("更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id) {
        departmentService.removeById(id);
        return Result.success("删除成功");
    }
}
