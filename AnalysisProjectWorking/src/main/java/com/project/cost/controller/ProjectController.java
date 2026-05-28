package com.project.cost.controller;

import com.project.cost.common.Result;
import com.project.cost.entity.Project;
import com.project.cost.entity.ProjectMember;
import com.project.cost.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/project")
@CrossOrigin
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @PostMapping("/create")
    public Result<Project> create(@RequestBody Project project) {
        try {
            return Result.success(projectService.createProject(project));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/update")
    public Result<Project> update(@RequestBody Project project) {
        return Result.success(projectService.updateProject(project));
    }

    @GetMapping("/list")
    public Result<List<Project>> getAllProjects() {
        return Result.success(projectService.getAllProjects());
    }

    @GetMapping("/user/{userId}")
    public Result<List<Project>> getUserProjects(@PathVariable Long userId) {
        return Result.success(projectService.getUserProjects(userId));
    }

    @GetMapping("/{id}")
    public Result<Project> getById(@PathVariable Long id) {
        return Result.success(projectService.getById(id));
    }

    @PostMapping("/member/add")
    public Result<Void> addMember(@RequestBody Map<String, Object> params) {
        try {
            Long projectId = Long.valueOf(params.get("projectId").toString());
            Long userId = Long.valueOf(params.get("userId").toString());
            String role = (String) params.get("role");
            Integer hourlyRate = params.get("hourlyRate") != null ?
                    Integer.valueOf(params.get("hourlyRate").toString()) : null;
            projectService.addProjectMember(projectId, userId, role, hourlyRate);
            return Result.success();
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @DeleteMapping("/member/{projectId}/{userId}")
    public Result<Void> removeMember(@PathVariable Long projectId, @PathVariable Long userId) {
        projectService.removeProjectMember(projectId, userId);
        return Result.success();
    }

    @GetMapping("/{projectId}/members")
    public Result<List<ProjectMember>> getMembers(@PathVariable Long projectId) {
        return Result.success(projectService.getProjectMembers(projectId));
    }
}
