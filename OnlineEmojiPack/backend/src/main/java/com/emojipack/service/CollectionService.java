package com.emojipack.service;

import com.emojipack.dto.CollectionCreateDTO;
import com.emojipack.entity.Collection;
import com.emojipack.vo.CollectionVO;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

public interface CollectionService {

    IPage<CollectionVO> page(Page<Collection> page, String keyword, Long userId, Integer isPublic);

    CollectionVO getById(Long id);

    CollectionVO create(CollectionCreateDTO dto, Long userId);

    void addMaterial(Long collectionId, Long materialId, Long userId);

    void removeMaterial(Long collectionId, Long materialId, Long userId);

    void delete(Long id, Long userId);
}
