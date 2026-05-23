package com.oj.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.oj.entity.Tag;

import java.util.List;

public interface TagService extends IService<Tag> {
    List<Tag> getAllTags();
    Tag createTag(Tag tag);
    void deleteTag(Long id);
}
