package com.project.cost.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.project.cost.entity.Project;
import com.project.cost.entity.ProjectMember;
import com.project.cost.entity.User;
import com.project.cost.mapper.ProjectMapper;
import com.project.cost.mapper.ProjectMemberMapper;
import com.project.cost.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService extends ServiceImpl<ProjectMapper, Project> {

    @Autowired
    private ProjectMemberMapper projectMemberMapper;

    @Autowired
    private UserMapper userMapper;

    @Transactional
    public Project createProject(Project project) {
        project.setStatus(1);
        project.setCreateTime(LocalDateTime.now());
        project.setUpdateTime(LocalDateTime.now());
        save(project);

        if (project.getManagerId() != null) {
            ProjectMember member = new ProjectMember();
            member.setProjectId(project.getProjectId());
            member.setUserId(project.getManagerId());
            member.setRole("manager");
            member.setJoinDate(project.getStartDate());
            member.setCreateTime(LocalDateTime.now());
            User manager = userMapper.selectById(project.getManagerId());
            if (manager != null) {
                member.setHourlyRate(manager.getHourlyRate());
            }
            projectMemberMapper.insert(member);
        }

        return project;
    }

    @Transactional
    public Project updateProject(Project project) {
        project.setUpdateTime(LocalDateTime.now());
        updateById(project);
        return project;
    }

    @Transactional
    public void addProjectMember(Long projectId, Long userId, String role, Integer hourlyRate) {
        ProjectMember existing = projectMemberMapper.selectOne(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, projectId)
                        .eq(ProjectMember::getUserId, userId)
        );

        if (existing != null) {
            throw new RuntimeException("User is already a project member");
        }

        ProjectMember member = new ProjectMember();
        member.setProjectId(projectId);
        member.setUserId(userId);
        member.setRole(role != null ? role : "member");
        member.setCreateTime(LocalDateTime.now());

        if (hourlyRate != null && hourlyRate > 0) {
            member.setHourlyRate(hourlyRate);
        } else {
            User user = userMapper.selectById(userId);
            if (user != null) {
                member.setHourlyRate(user.getHourlyRate());
            }
        }

        projectMemberMapper.insert(member);
    }

    @Transactional
    public void removeProjectMember(Long projectId, Long userId) {
        projectMemberMapper.delete(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, projectId)
                        .eq(ProjectMember::getUserId, userId)
        );
    }

    public List<ProjectMember> getProjectMembers(Long projectId) {
        return projectMemberMapper.selectList(
                new LambdaQueryWrapper<ProjectMember>().eq(ProjectMember::getProjectId, projectId)
        );
    }

    public List<Project> getUserProjects(Long userId) {
        List<ProjectMember> memberships = projectMemberMapper.selectList(
                new LambdaQueryWrapper<ProjectMember>().eq(ProjectMember::getUserId, userId)
        );

        List<Long> projectIds = memberships.stream()
                .map(ProjectMember::getProjectId)
                .collect(Collectors.toList());

        if (projectIds.isEmpty()) {
            return Collections.emptyList();
        }

        return listByIds(projectIds);
    }

    public List<Project> getAllProjects() {
        return list(new LambdaQueryWrapper<Project>().orderByDesc(Project::getCreateTime));
    }

    public int getUserHourlyRate(Long projectId, Long userId) {
        ProjectMember member = projectMemberMapper.selectOne(
                new LambdaQueryWrapper<ProjectMember>()
                        .eq(ProjectMember::getProjectId, projectId)
                        .eq(ProjectMember::getUserId, userId)
        );

        if (member != null && member.getHourlyRate() != null && member.getHourlyRate() > 0) {
            return member.getHourlyRate();
        }

        User user = userMapper.selectById(userId);
        if (user != null && user.getHourlyRate() != null) {
            return user.getHourlyRate();
        }

        return 0;
    }
}
