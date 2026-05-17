package com.construction.company.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.construction.company.entity.ConstructionNode;
import com.construction.company.mapper.ConstructionNodeMapper;
import com.construction.company.service.ConstructionNodeService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ConstructionNodeServiceImpl extends ServiceImpl<ConstructionNodeMapper, ConstructionNode> implements ConstructionNodeService {

    @Override
    public boolean save(ConstructionNode constructionNode) {
        return super.save(constructionNode);
    }

    @Override
    public boolean updateById(ConstructionNode constructionNode) {
        return super.updateById(constructionNode);
    }

    @Override
    public boolean removeById(Long id) {
        return super.removeById(id);
    }

    @Override
    public ConstructionNode getById(Long id) {
        return super.getById(id);
    }

    @Override
    public List<ConstructionNode> list() {
        return super.list();
    }
}
