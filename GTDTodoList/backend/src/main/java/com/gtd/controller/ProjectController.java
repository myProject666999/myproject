package com.gtd.controller;

import com.gtd.entity.Project;
import com.gtd.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Project>> getActiveProjects(@PathVariable Long userId) {
        return ResponseEntity.ok(projectService.getActiveProjects(userId));
    }

    @GetMapping("/user/{userId}/all")
    public ResponseEntity<List<Project>> getAllProjects(@PathVariable Long userId) {
        return ResponseEntity.ok(projectService.getAllProjects(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return projectService.getProjectById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Project project) {
        return ResponseEntity.ok(projectService.createProject(project));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody Project project) {
        project.setId(id);
        return ResponseEntity.ok(projectService.updateProject(project));
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<Void> archiveProject(@PathVariable Long id) {
        projectService.archiveProject(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/unarchive")
    public ResponseEntity<Void> unarchiveProject(@PathVariable Long id) {
        projectService.unarchiveProject(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/sort")
    public ResponseEntity<Void> updateSortOrder(@RequestBody Map<String, List<Long>> body) {
        List<Long> projectIds = body.get("projectIds");
        projectService.updateSortOrder(projectIds);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok().build();
    }
}
