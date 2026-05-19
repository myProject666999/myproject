package com.mindmap.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mindmap.entity.MindMap;

import java.util.List;

public interface MindMapService extends IService<MindMap> {
    List<MindMap> listByUserId(Long userId);
    MindMap getDetail(Long id);
    boolean saveMindMap(MindMap mindMap);
    boolean updateMindMap(MindMap mindMap);
    boolean deleteMindMap(Long id);
}
