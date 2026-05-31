package com.carbon.emission.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.carbon.emission.entity.Organization;
import com.carbon.emission.mapper.OrganizationMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrganizationService extends ServiceImpl<OrganizationMapper, Organization> {

    public List<Organization> getOrganizationTree() {
        List<Organization> allOrgs = list(new LambdaQueryWrapper<Organization>()
                .orderByAsc(Organization::getSortOrder));
        
        return buildTree(allOrgs, 0L);
    }

    private List<Organization> buildTree(List<Organization> allOrgs, Long parentId) {
        List<Organization> tree = new ArrayList<>();
        for (Organization org : allOrgs) {
            if (org.getParentId().equals(parentId)) {
                tree.add(org);
                org.setChildren(buildTree(allOrgs, org.getId()));
            }
        }
        return tree;
    }

    public List<Organization> getChildOrganizations(Long parentId) {
        List<Organization> allOrgs = list(new LambdaQueryWrapper<Organization>()
                .eq(Organization::getStatus, 1));
        return getAllChildren(allOrgs, parentId);
    }

    private List<Organization> getAllChildren(List<Organization> allOrgs, Long parentId) {
        List<Organization> children = new ArrayList<>();
        for (Organization org : allOrgs) {
            if (org.getParentId().equals(parentId)) {
                children.add(org);
                children.addAll(getAllChildren(allOrgs, org.getId()));
            }
        }
        return children;
    }
}
