package com.construction.company.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.construction.company.entity.Project;
import com.construction.company.mapper.ProjectMapper;
import com.construction.company.service.ProjectService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectServiceImpl extends ServiceImpl<ProjectMapper, Project> implements ProjectService {

    @Override
    public boolean save(Project project) {
        return super.save(project);
    }

    @Override
    public boolean updateById(Project project) {
        return super.updateById(project);
    }

    @Override
    public boolean removeById(Long id) {
        return super.removeById(id);
    }

    @Override
    public Project getById(Long id) {
        return super.getById(id);
    }

    @Override
    public List<Project> list() {
        return super.list();
    }
}
