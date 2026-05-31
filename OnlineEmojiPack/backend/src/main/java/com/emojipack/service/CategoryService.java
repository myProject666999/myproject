package com.emojipack.service;

import com.emojipack.entity.Category;

import java.util.List;

public interface CategoryService {

    List<Category> list();

    Category getById(Long id);
}
