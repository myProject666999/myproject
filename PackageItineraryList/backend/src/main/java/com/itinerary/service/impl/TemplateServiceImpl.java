package com.itinerary.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.itinerary.entity.Template;
import com.itinerary.entity.TemplateItem;
import com.itinerary.mapper.TemplateItemMapper;
import com.itinerary.mapper.TemplateMapper;
import com.itinerary.service.TemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class TemplateServiceImpl extends ServiceImpl<TemplateMapper, Template> implements TemplateService {

    @Autowired
    private TemplateItemMapper templateItemMapper;

    @Override
    public List<Template> getPublicTemplates() {
        LambdaQueryWrapper<Template> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Template::getIsPublic, 1).orderByAsc(Template::getId);
        return list(wrapper);
    }

    @Override
    public List<Template> getUserTemplates(Long userId) {
        LambdaQueryWrapper<Template> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Template::getCreatorId, userId).orderByDesc(Template::getCreatedAt);
        return list(wrapper);
    }

    @Override
    public List<TemplateItem> getTemplateItems(Long templateId) {
        LambdaQueryWrapper<TemplateItem> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TemplateItem::getTemplateId, templateId)
                .orderByAsc(TemplateItem::getCategoryId, TemplateItem::getSortOrder);
        return templateItemMapper.selectList(wrapper);
    }

    @Override
    public Template createTemplate(Template template, Long userId) {
        template.setCreatorId(userId);
        template.setIsSystem(0);
        save(template);
        return template;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Template inheritTemplate(Long parentId, Template template, Long userId) {
        Template parent = getById(parentId);
        if (parent == null) {
            throw new RuntimeException("父模板不存在");
        }
        template.setParentId(parentId);
        template.setCreatorId(userId);
        template.setIsSystem(0);
        template.setSceneType(parent.getSceneType());
        save(template);
        List<TemplateItem> parentItems = getTemplateItems(parentId);
        List<TemplateItem> newItems = new ArrayList<>();
        for (TemplateItem item : parentItems) {
            TemplateItem newItem = new TemplateItem();
            newItem.setTemplateId(template.getId());
            newItem.setCategoryId(item.getCategoryId());
            newItem.setName(item.getName());
            newItem.setDescription(item.getDescription());
            newItem.setDefaultQuantity(item.getDefaultQuantity());
            newItem.setIsRequired(item.getIsRequired());
            newItem.setSortOrder(item.getSortOrder());
            newItems.add(newItem);
        }
        for (TemplateItem item : newItems) {
            templateItemMapper.insert(item);
        }
        return template;
    }
}
