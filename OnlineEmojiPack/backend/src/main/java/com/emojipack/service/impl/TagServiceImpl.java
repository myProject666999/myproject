package com.emojipack.service.impl;

import com.emojipack.entity.MaterialTag;
import com.emojipack.entity.Tag;
import com.emojipack.mapper.MaterialTagMapper;
import com.emojipack.mapper.TagMapper;
import com.emojipack.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagMapper tagMapper;
    private final MaterialTagMapper materialTagMapper;

    @Override
    public List<Tag> list() {
        return tagMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<Tag>()
                        .eq("status", 1)
                        .orderByDesc("usage_count")
        );
    }

    @Override
    public List<Tag> searchByName(String name) {
        return tagMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<Tag>()
                        .like("name", name)
                        .eq("status", 1)
                        .orderByDesc("usage_count")
        );
    }

    @Override
    public Tag getOrCreate(String name) {
        Tag tag = tagMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<Tag>()
                        .eq("name", name)
        );
        if (tag == null) {
            tag = new Tag();
            tag.setName(name);
            tag.setUsageCount(0);
            tag.setStatus(1);
            tag.setCreateTime(LocalDateTime.now());
            tagMapper.insert(tag);
        }
        return tag;
    }

    @Override
    public List<Tag> getByMaterialId(Long materialId) {
        List<MaterialTag> materialTags = materialTagMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<MaterialTag>()
                        .eq("material_id", materialId)
        );
        if (materialTags.isEmpty()) {
            return List.of();
        }
        List<Long> tagIds = materialTags.stream()
                .map(MaterialTag::getTagId)
                .collect(Collectors.toList());
        return tagMapper.selectBatchIds(tagIds);
    }
}
