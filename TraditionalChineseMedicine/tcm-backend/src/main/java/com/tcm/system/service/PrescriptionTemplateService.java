package com.tcm.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tcm.system.entity.PrescriptionTemplate;
import com.tcm.system.entity.PrescriptionTemplateHerb;
import com.tcm.system.repository.PrescriptionTemplateHerbRepository;
import com.tcm.system.repository.PrescriptionTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PrescriptionTemplateService {

    @Autowired
    private PrescriptionTemplateRepository templateRepository;

    @Autowired
    private PrescriptionTemplateHerbRepository templateHerbRepository;

    public List<PrescriptionTemplate> list(String keyword, String category, Boolean isClassic) {
        LambdaQueryWrapper<PrescriptionTemplate> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(PrescriptionTemplate::getName, keyword);
        }
        if (category != null && !category.isEmpty()) {
            wrapper.eq(PrescriptionTemplate::getCategory, category);
        }
        if (isClassic != null) {
            wrapper.eq(PrescriptionTemplate::getIsClassic, isClassic ? 1 : 0);
        }
        wrapper.orderByDesc(PrescriptionTemplate::getCreateTime);
        return templateRepository.selectList(wrapper);
    }

    public PrescriptionTemplate getById(Long id) {
        return templateRepository.selectById(id);
    }

    public List<PrescriptionTemplateHerb> getHerbsByTemplateId(Long templateId) {
        LambdaQueryWrapper<PrescriptionTemplateHerb> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PrescriptionTemplateHerb::getTemplateId, templateId);
        wrapper.orderByAsc(PrescriptionTemplateHerb::getSortOrder);
        return templateHerbRepository.selectList(wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean save(PrescriptionTemplate template, List<PrescriptionTemplateHerb> herbs) {
        templateRepository.insert(template);
        if (herbs != null && !herbs.isEmpty()) {
            for (int i = 0; i < herbs.size(); i++) {
                PrescriptionTemplateHerb herb = herbs.get(i);
                herb.setTemplateId(template.getId());
                herb.setSortOrder(i + 1);
                templateHerbRepository.insert(herb);
            }
        }
        return true;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean update(PrescriptionTemplate template, List<PrescriptionTemplateHerb> herbs) {
        templateRepository.updateById(template);

        LambdaQueryWrapper<PrescriptionTemplateHerb> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PrescriptionTemplateHerb::getTemplateId, template.getId());
        templateHerbRepository.delete(wrapper);

        if (herbs != null && !herbs.isEmpty()) {
            for (int i = 0; i < herbs.size(); i++) {
                PrescriptionTemplateHerb herb = herbs.get(i);
                herb.setTemplateId(template.getId());
                herb.setSortOrder(i + 1);
                templateHerbRepository.insert(herb);
            }
        }
        return true;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean delete(Long id) {
        LambdaQueryWrapper<PrescriptionTemplateHerb> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PrescriptionTemplateHerb::getTemplateId, id);
        templateHerbRepository.delete(wrapper);
        return templateRepository.deleteById(id) > 0;
    }
}
