package com.corporate.reimbursement.controller;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.corporate.reimbursement.common.Result;
import com.corporate.reimbursement.entity.ReimbursementType;
import com.corporate.reimbursement.entity.SysDept;
import com.corporate.reimbursement.entity.SysUser;
import com.corporate.reimbursement.mapper.ReimbursementTypeMapper;
import com.corporate.reimbursement.mapper.SysDeptMapper;
import com.corporate.reimbursement.mapper.SysUserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/common")
public class CommonController {

    @Autowired
    private ReimbursementTypeMapper reimbursementTypeMapper;

    @Autowired
    private SysDeptMapper sysDeptMapper;

    @Autowired
    private SysUserMapper sysUserMapper;

    @GetMapping("/reimbursement-types")
    public Result<List<ReimbursementType>> reimbursementTypes() {
        List<ReimbursementType> types = reimbursementTypeMapper.selectList(
                Wrappers.<ReimbursementType>lambdaQuery().eq(ReimbursementType::getStatus, 1));
        return Result.success(types);
    }

    @GetMapping("/departments")
    public Result<List<Map<String, Object>>> departments() {
        List<SysDept> allDepts = sysDeptMapper.selectList(
                Wrappers.<SysDept>lambdaQuery().eq(SysDept::getStatus, 1));

        List<Map<String, Object>> tree = buildDeptTree(allDepts, 0L);
        return Result.success(tree);
    }

    private List<Map<String, Object>> buildDeptTree(List<SysDept> allDepts, Long parentId) {
        List<Map<String, Object>> tree = new ArrayList<>();
        for (SysDept dept : allDepts) {
            Long currentParentId = dept.getParentId() != null ? dept.getParentId() : 0L;
            if (currentParentId.equals(parentId)) {
                Map<String, Object> node = new HashMap<>();
                node.put("id", dept.getId());
                node.put("deptName", dept.getDeptName());
                node.put("parentId", dept.getParentId());
                node.put("children", buildDeptTree(allDepts, dept.getId()));
                tree.add(node);
            }
        }
        return tree;
    }

    @GetMapping("/users")
    public Result<List<SysUser>> users() {
        List<SysUser> users = sysUserMapper.selectList(
                Wrappers.<SysUser>lambdaQuery().eq(SysUser::getStatus, 1));
        return Result.success(users);
    }
}