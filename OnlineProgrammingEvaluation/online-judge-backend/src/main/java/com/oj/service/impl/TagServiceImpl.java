package com.oj.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.oj.entity.Tag;
import com.oj.mapper.TagMapper;
import com.oj.service.TagService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TagServiceImpl extends ServiceImpl<TagMapper, Tag> implements TagService {

    @Override
    public List<Tag> getAllTags() {
        return this.list();
    }

    @Override
    public Tag createTag(Tag tag) {
        this.save(tag);
        return tag;
    }

    @Override
    public void deleteTag(Long id) {
        this.removeById(id);
    }
}
