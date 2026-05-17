package com.construction.company.service;

import com.construction.company.entity.Project;

import java.util.List;

public interface ProjectService {
    boolean save(Project project);
    boolean updateById(Project project);
    boolean removeById(Long id);
    Project getById(Long id);
    List<Project> list();
}
