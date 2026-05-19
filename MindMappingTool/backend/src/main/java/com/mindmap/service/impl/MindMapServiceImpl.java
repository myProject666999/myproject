package com.mindmap.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mindmap.entity.MindMap;
import com.mindmap.mapper.MindMapMapper;
import com.mindmap.service.MindMapService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MindMapServiceImpl extends ServiceImpl<MindMapMapper, MindMap> implements MindMapService {

    @Override
    public List<MindMap> listByUserId(Long userId) {
        LambdaQueryWrapper<MindMap> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MindMap::getUserId, userId)
                .orderByDesc(MindMap::getUpdatedAt);
        return list(wrapper);
    }

    @Override
    public MindMap getDetail(Long id) {
        return getById(id);
    }

    @Override
    public boolean saveMindMap(MindMap mindMap) {
        return save(mindMap);
    }

    @Override
    public boolean updateMindMap(MindMap mindMap) {
        return updateById(mindMap);
    }

    @Override
    public boolean deleteMindMap(Long id) {
        return removeById(id);
    }
}
