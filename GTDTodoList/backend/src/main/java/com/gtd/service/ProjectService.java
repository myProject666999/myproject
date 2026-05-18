package com.gtd.service;

import com.gtd.entity.Project;
import com.gtd.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    public List<Project> getActiveProjects(Long userId) {
        return projectRepository.findByUserIdAndIsArchivedFalseOrderBySortOrderAscCreatedAtDesc(userId);
    }

    public List<Project> getAllProjects(Long userId) {
        return projectRepository.findByUserIdOrderBySortOrderAscCreatedAtDesc(userId);
    }

    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }

    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    public Project updateProject(Project project) {
        return projectRepository.save(project);
    }

    @Transactional
    public void archiveProject(Long id) {
        projectRepository.findById(id).ifPresent(project -> {
            project.setIsArchived(true);
            projectRepository.save(project);
        });
    }

    @Transactional
    public void unarchiveProject(Long id) {
        projectRepository.findById(id).ifPresent(project -> {
            project.setIsArchived(false);
            projectRepository.save(project);
        });
    }

    @Transactional
    public void updateSortOrder(List<Long> projectIds) {
        for (int i = 0; i < projectIds.size(); i++) {
            Long id = projectIds.get(i);
            projectRepository.findById(id).ifPresent(project -> {
                project.setSortOrder(i);
                projectRepository.save(project);
            });
        }
    }

    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }
}
