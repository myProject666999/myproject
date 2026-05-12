
package com.beautyhair.controller;

import com.beautyhair.common.PageResult;
import com.beautyhair.common.Result;
import com.beautyhair.entity.Employee;
import com.beautyhair.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employee")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping("/page")
    public Result<PageResult<Employee>> getEmployeePage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer isTechnician,
            @RequestParam(required = false) Integer status) {
        PageResult<Employee> result = employeeService.getEmployeePage(page, size, keyword, isTechnician, status);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<Employee> getById(@PathVariable Long id) {
        Employee employee = employeeService.getById(id);
        return Result.success(employee);
    }

    @GetMapping("/all")
    public Result<List<Employee>> getAll() {
        List<Employee> employees = employeeService.getAll();
        return Result.success(employees);
    }

    @GetMapping("/technicians")
    public Result<List<Employee>> getTechnicians() {
        List<Employee> technicians = employeeService.getTechnicians();
        return Result.success(technicians);
    }

    @PostMapping
    public Result<Void> add(@RequestBody Employee employee) {
        employeeService.add(employee);
        return Result.success("新增成功");
    }

    @PutMapping
    public Result<Void> update(@RequestBody Employee employee) {
        employeeService.update(employee);
        return Result.success("更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        employeeService.delete(id);
        return Result.success("删除成功");
    }
}
