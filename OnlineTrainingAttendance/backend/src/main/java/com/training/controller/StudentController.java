package com.training.controller;

import com.training.common.Result;
import com.training.entity.Student;
import com.training.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @GetMapping("/{id}")
    public Result<Student> getById(@PathVariable Long id) {
        return studentService.getById(id);
    }

    @GetMapping
    public Result<List<Student>> list(@RequestParam(required = false) String name,
                                      @RequestParam(required = false) Integer gender) {
        return studentService.list(name, gender);
    }

    @PostMapping
    public Result<Student> save(@RequestBody Student student) {
        return studentService.add(student);
    }

    @PutMapping
    public Result<Student> update(@RequestBody Student student) {
        return studentService.update(student);
    }

    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id) {
        return studentService.delete(id);
    }

    @PostMapping("/batch-import")
    public Result<String> batchImport(@RequestBody List<Student> students) {
        return studentService.batchImport(students);
    }
}
