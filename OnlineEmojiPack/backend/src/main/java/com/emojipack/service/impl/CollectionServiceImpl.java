package com.emojipack.service.impl;

import com.emojipack.common.BusinessException;
import com.emojipack.dto.CollectionCreateDTO;
import com.emojipack.entity.*;
import com.emojipack.mapper.*;
import com.emojipack.service.CollectionService;
import com.emojipack.service.MaterialService;
import com.emojipack.service.UserService;
import com.emojipack.vo.CollectionVO;
import com.emojipack.vo.MaterialVO;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CollectionServiceImpl implements CollectionService {

    private final CollectionMapper collectionMapper;
    private final CollectionMaterialMapper collectionMaterialMapper;
    private final MaterialService materialService;
    private final UserService userService;

    @Override
    public IPage<CollectionVO> page(Page<Collection> page, String keyword, Long userId, Integer isPublic) {
        IPage<Collection> collectionPage = collectionMapper.selectPageWithDetail(page, keyword, userId, isPublic);
        return collectionPage.convert(this::convertToVO);
    }

    @Override
    public CollectionVO getById(Long id) {
        Collection collection = collectionMapper.selectById(id);
        if (collection == null) {
            throw new BusinessException("合集不存在");
        }
        return convertToVO(collection);
    }

    @Override
    @Transactional
    public CollectionVO create(CollectionCreateDTO dto, Long userId) {
        Collection collection = new Collection();
        collection.setTitle(dto.getTitle());
        collection.setDescription(dto.getDescription());
        collection.setCoverUrl(dto.getCoverUrl());
        collection.setUserId(userId);
        collection.setIsPublic(dto.getIsPublic() != null ? dto.getIsPublic() : 1);
        collection.setMaterialCount(0);
        collection.setFavoriteCount(0);
        collection.setViewCount(0);
        collection.setStatus(1);
        collection.setCreateTime(LocalDateTime.now());
        collection.setUpdateTime(LocalDateTime.now());
        collectionMapper.insert(collection);
        return convertToVO(collection);
    }

    @Override
    @Transactional
    public void addMaterial(Long collectionId, Long materialId, Long userId) {
        Collection collection = collectionMapper.selectById(collectionId);
        if (collection == null) {
            throw new BusinessException("合集不存在");
        }
        if (!collection.getUserId().equals(userId)) {
            throw new BusinessException("无权修改此合集");
        }

        CollectionMaterial exist = collectionMaterialMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<CollectionMaterial>()
                        .eq("collection_id", collectionId)
                        .eq("material_id", materialId)
        );
        if (exist != null) {
            throw new BusinessException("素材已在合集中");
        }

        CollectionMaterial collectionMaterial = new CollectionMaterial();
        collectionMaterial.setCollectionId(collectionId);
        collectionMaterial.setMaterialId(materialId);
        collectionMaterial.setSort(0);
        collectionMaterial.setCreateTime(LocalDateTime.now());
        collectionMaterialMapper.insert(collectionMaterial);

        collection.setMaterialCount(collection.getMaterialCount() + 1);
        collection.setUpdateTime(LocalDateTime.now());
        collectionMapper.updateById(collection);
    }

    @Override
    @Transactional
    public void removeMaterial(Long collectionId, Long materialId, Long userId) {
        Collection collection = collectionMapper.selectById(collectionId);
        if (collection == null) {
            throw new BusinessException("合集不存在");
        }
        if (!collection.getUserId().equals(userId)) {
            throw new BusinessException("无权修改此合集");
        }

        collectionMaterialMapper.delete(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<CollectionMaterial>()
                        .eq("collection_id", collectionId)
                        .eq("material_id", materialId)
        );

        collection.setMaterialCount(Math.max(0, collection.getMaterialCount() - 1));
        collection.setUpdateTime(LocalDateTime.now());
        collectionMapper.updateById(collection);
    }

    @Override
    @Transactional
    public void delete(Long id, Long userId) {
        Collection collection = collectionMapper.selectById(id);
        if (collection == null) {
            throw new BusinessException("合集不存在");
        }
        if (!collection.getUserId().equals(userId)) {
            throw new BusinessException("无权删除此合集");
        }

        collectionMaterialMapper.delete(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<CollectionMaterial>()
                        .eq("collection_id", id)
        );
        collectionMapper.deleteById(id);
    }

    private CollectionVO convertToVO(Collection collection) {
        CollectionVO vo = new CollectionVO();
        BeanUtils.copyProperties(collection, vo);

        User user = userService.getById(collection.getUserId());
        if (user != null) {
            vo.setUserName(user.getNickname());
        }

        List<CollectionMaterial> materials = collectionMaterialMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<CollectionMaterial>()
                        .eq("collection_id", collection.getId())
                        .orderByAsc("sort")
        );
        List<MaterialVO> materialVOs = new ArrayList<>();
        for (CollectionMaterial cm : materials) {
            MaterialVO materialVO = materialService.getById(cm.getMaterialId());
            materialVOs.add(materialVO);
        }
        vo.setMaterials(materialVOs);

        return vo;
    }
}
