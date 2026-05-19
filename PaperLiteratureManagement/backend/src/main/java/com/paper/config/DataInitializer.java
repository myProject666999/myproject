package com.paper.config;

import com.paper.entity.Tag;
import com.paper.repository.TagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private TagRepository tagRepository;

    @Override
    public void run(String... args) {
        if (tagRepository.count() == 0) {
            createTag("机器学习", "#ef4444");
            createTag("深度学习", "#f97316");
            createTag("自然语言处理", "#eab308");
            createTag("计算机视觉", "#22c55e");
            createTag("强化学习", "#3b82f6");
            createTag("数据挖掘", "#8b5cf6");
            createTag("推荐系统", "#ec4899");
            createTag("待读", "#64748b");
            createTag("已读", "#10b981");
            createTag("重要", "#dc2626");
        }
    }

    private void createTag(String name, String color) {
        Tag tag = new Tag();
        tag.setName(name);
        tag.setColor(color);
        tagRepository.save(tag);
    }
}
