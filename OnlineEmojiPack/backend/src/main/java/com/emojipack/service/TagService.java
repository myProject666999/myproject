package com.emojipack.service;

import com.emojipack.entity.Tag;

import java.util.List;

public interface TagService {

    List<Tag> list();

    List<Tag> searchByName(String name);

    Tag getOrCreate(String name);

    List<Tag> getByMaterialId(Long materialId);
}
