package com.itinerary.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.itinerary.entity.Template;
import com.itinerary.entity.TemplateItem;

import java.util.List;

public interface TemplateService extends IService<Template> {
    List<Template> getPublicTemplates();
    List<Template> getUserTemplates(Long userId);
    List<TemplateItem> getTemplateItems(Long templateId);
    Template createTemplate(Template template, Long userId);
    Template inheritTemplate(Long parentId, Template template, Long userId);
}
