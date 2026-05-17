package com.construction.company.controller;

import com.construction.company.common.Result;
import com.construction.company.entity.Project;
import com.construction.company.service.ProjectService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "项目管理")
@RestController
@RequestMapping("/project")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @ApiOperation("查询项目列表")
    @GetMapping("/list")
    public Result<List<Project>> list() {
        return Result.success(projectService.list());
    }

    @ApiOperation("根据ID查询项目")
    @GetMapping("/{id}")
    public Result<Project> getById(@PathVariable Long id) {
        return Result.success(projectService.getById(id));
    }

    @ApiOperation("新增项目")
    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody Project project) {
        return Result.success(projectService.save(project));
    }

    @ApiOperation("更新项目")
    @PutMapping("/update")
    public Result<Boolean> update(@RequestBody Project project) {
        return Result.success(projectService.updateById(project));
    }

    @ApiOperation("删除项目")
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(projectService.removeById(id));
    }
}
