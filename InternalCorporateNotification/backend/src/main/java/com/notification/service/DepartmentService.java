package com.notification.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.notification.entity.Department;
import com.notification.mapper.DepartmentMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DepartmentService extends ServiceImpl<DepartmentMapper, Department> {

    public List<Department> getDepartmentTree() {
        List<Department> allDepartments = this.list(new LambdaQueryWrapper<Department>()
                .eq(Department::getStatus, 1)
                .orderByAsc(Department::getSortOrder));

        Map<Long, Department> departmentMap = allDepartments.stream()
                .collect(Collectors.toMap(Department::getId, dept -> dept));

        List<Department> roots = new ArrayList<>();
        for (Department dept : allDepartments) {
            if (dept.getParentId() == null || dept.getParentId() == 0) {
                roots.add(dept);
            } else {
                Department parent = departmentMap.get(dept.getParentId());
                if (parent != null) {
                    if (parent.getChildren() == null) {
                        parent.setChildren(new ArrayList<>());
                    }
                    parent.getChildren().add(dept);
                }
            }
        }
        return roots;
    }

    public List<Long> getSubDepartmentIds(Long departmentId) {
        List<Long> ids = new ArrayList<>();
        collectDepartmentIds(departmentId, ids);
        return ids;
    }

    private void collectDepartmentIds(Long parentId, List<Long> ids) {
        ids.add(parentId);
        List<Department> children = this.list(new LambdaQueryWrapper<Department>()
                .eq(Department::getParentId, parentId));
        for (Department child : children) {
            collectDepartmentIds(child.getId(), ids);
        }
    }
}
