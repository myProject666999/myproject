package com.emojipack.service.impl;

import com.emojipack.common.BusinessException;
import com.emojipack.dto.MaterialUploadDTO;
import com.emojipack.entity.*;
import com.emojipack.mapper.*;
import com.emojipack.service.CategoryService;
import com.emojipack.service.MaterialService;
import com.emojipack.service.TagService;
import com.emojipack.service.UserService;
import com.emojipack.vo.MaterialVO;
import com.emojipack.vo.TagVO;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class MaterialServiceImpl implements MaterialService {

    private final MaterialMapper materialMapper;
    private final MaterialTagMapper materialTagMapper;
    private final TagService tagService;
    private final CategoryService categoryService;
    private final UserService userService;
    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${upload.path}")
    private String uploadPath;

    @Value("${upload.url-prefix}")
    private String urlPrefix;

    private static final String VIEW_COUNT_KEY = "material:view:";
    private static final String DOWNLOAD_COUNT_KEY = "material:download:";

    @Override
    public IPage<MaterialVO> page(Page<Material> page, String keyword, Long categoryId, Long tagId, Long uploaderId, String sort) {
        IPage<Material> materialPage = materialMapper.selectPageWithDetail(page, keyword, categoryId, tagId, uploaderId, sort);
        return materialPage.convert(this::convertToVO);
    }

    @Override
    public MaterialVO getById(Long id) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException("素材不存在");
        }
        return convertToVO(material);
    }

    @Override
    @Transactional
    public MaterialVO upload(MultipartFile file, MaterialUploadDTO dto, Long userId) {
        if (file.isEmpty()) {
            throw new BusinessException("文件不能为空");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null ?
                originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase() : "";

        List<String> allowedExtensions = List.of(".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp");
        if (!allowedExtensions.contains(extension)) {
            throw new BusinessException("不支持的文件类型");
        }

        String datePath = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String fileName = UUID.randomUUID().toString().replace("-", "") + extension;
        String relativePath = datePath + "/" + fileName;
        Path fullPath = Paths.get(uploadPath, relativePath);

        try {
            Files.createDirectories(fullPath.getParent());
            file.transferTo(fullPath.toFile());
        } catch (IOException e) {
            log.error("文件保存失败", e);
            throw new BusinessException("文件保存失败");
        }

        int width = 0;
        int height = 0;
        try {
            BufferedImage image = ImageIO.read(fullPath.toFile());
            if (image != null) {
                width = image.getWidth();
                height = image.getHeight();
            }
        } catch (IOException e) {
            log.warn("无法读取图片尺寸", e);
        }

        String thumbnailName = "thumb_" + fileName;
        Path thumbnailPath = Paths.get(uploadPath, datePath, thumbnailName);
        try {
            BufferedImage originalImage = ImageIO.read(fullPath.toFile());
            if (originalImage != null) {
                int thumbWidth = 300;
                int thumbHeight = (int) ((double) originalImage.getHeight() / originalImage.getWidth() * thumbWidth);
                BufferedImage thumbnail = new BufferedImage(thumbWidth, thumbHeight, BufferedImage.TYPE_INT_RGB);
                Graphics2D g2d = thumbnail.createGraphics();
                g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                g2d.drawImage(originalImage, 0, 0, thumbWidth, thumbHeight, null);
                g2d.dispose();
                ImageIO.write(thumbnail, extension.replace(".", ""), thumbnailPath.toFile());
            }
        } catch (IOException e) {
            log.warn("缩略图生成失败", e);
        }

        String fileUrl = urlPrefix + "/" + relativePath.replace("\\", "/");
        String thumbnailUrl = urlPrefix + "/" + datePath.replace("\\", "/") + "/" + thumbnailName;

        Material material = new Material();
        material.setTitle(dto.getTitle() != null ? dto.getTitle() : originalFilename);
        material.setDescription(dto.getDescription());
        material.setCategoryId(dto.getCategoryId() != null ? dto.getCategoryId() : 6L);
        material.setUploaderId(userId);
        material.setFileUrl(fileUrl);
        material.setThumbnailUrl(thumbnailUrl);
        material.setFileType(file.getContentType());
        material.setFileSize(file.getSize());
        material.setWidth(width);
        material.setHeight(height);
        material.setIsCopyright(dto.getIsCopyright() != null ? dto.getIsCopyright() : 0);
        material.setDownloadLimit(dto.getDownloadLimit() != null ? dto.getDownloadLimit() : 0);
        material.setDownloadCount(0);
        material.setFavoriteCount(0);
        material.setViewCount(0);
        material.setStatus(1);
        material.setCreateTime(LocalDateTime.now());
        material.setUpdateTime(LocalDateTime.now());
        materialMapper.insert(material);

        if (dto.getTagNames() != null && !dto.getTagNames().isEmpty()) {
            for (String tagName : dto.getTagNames()) {
                if (tagName != null && !tagName.trim().isEmpty()) {
                    Tag tag = tagService.getOrCreate(tagName.trim());
                    MaterialTag materialTag = new MaterialTag();
                    materialTag.setMaterialId(material.getId());
                    materialTag.setTagId(tag.getId());
                    materialTag.setCreateTime(LocalDateTime.now());
                    materialTagMapper.insert(materialTag);

                    tag.setUsageCount(tag.getUsageCount() + 1);
                }
            }
        }

        return convertToVO(material);
    }

    @Override
    public void incrementViewCount(Long id) {
        String key = VIEW_COUNT_KEY + id;
        redisTemplate.opsForValue().increment(key);
        redisTemplate.expire(key, 1, TimeUnit.HOURS);
    }

    @Override
    public void incrementDownloadCount(Long id) {
        String key = DOWNLOAD_COUNT_KEY + id;
        redisTemplate.opsForValue().increment(key);
        redisTemplate.expire(key, 1, TimeUnit.HOURS);
    }

    @Override
    public void incrementFavoriteCount(Long id, boolean isFavorited) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException("素材不存在");
        }
        if (isFavorited) {
            material.setFavoriteCount(material.getFavoriteCount() + 1);
        } else {
            material.setFavoriteCount(Math.max(0, material.getFavoriteCount() - 1));
        }
        material.setUpdateTime(LocalDateTime.now());
        materialMapper.updateById(material);
    }

    @Override
    @Transactional
    public void delete(Long id, Long userId) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException("素材不存在");
        }
        if (!material.getUploaderId().equals(userId)) {
            throw new BusinessException("无权删除此素材");
        }
        materialTagMapper.delete(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<MaterialTag>()
                        .eq("material_id", id)
        );
        materialMapper.deleteById(id);
    }

    private MaterialVO convertToVO(Material material) {
        MaterialVO vo = new MaterialVO();
        BeanUtils.copyProperties(material, vo);

        Category category = categoryService.getById(material.getCategoryId());
        if (category != null) {
            vo.setCategoryName(category.getName());
        }

        User user = userService.getById(material.getUploaderId());
        if (user != null) {
            vo.setUploaderName(user.getNickname());
        }

        List<Tag> tags = tagService.getByMaterialId(material.getId());
        List<TagVO> tagVOs = new ArrayList<>();
        for (Tag tag : tags) {
            TagVO tagVO = new TagVO();
            tagVO.setId(tag.getId());
            tagVO.setName(tag.getName());
            tagVOs.add(tagVO);
        }
        vo.setTags(tagVOs);

        return vo;
    }
}
