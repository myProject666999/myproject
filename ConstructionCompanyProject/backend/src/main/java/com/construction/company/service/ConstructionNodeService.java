package com.construction.company.service;

import com.construction.company.entity.ConstructionNode;

import java.util.List;

public interface ConstructionNodeService {
    boolean save(ConstructionNode constructionNode);
    boolean updateById(ConstructionNode constructionNode);
    boolean removeById(Long id);
    ConstructionNode getById(Long id);
    List<ConstructionNode> list();
}
