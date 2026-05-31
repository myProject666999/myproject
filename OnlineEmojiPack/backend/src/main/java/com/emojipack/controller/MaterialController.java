package com.emojipack.controller;

import com.emojipack.common.Result;
import com.emojipack.dto.MaterialUploadDTO;
import com.emojipack.entity.Material;
import com.emojipack.service.FavoriteService;
import com.emojipack.service.MaterialService;
import com.emojipack.vo.MaterialVO;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;
    private final FavoriteService favoriteService;
    private final ObjectMapper objectMapper;

    @GetMapping("/public/list")
    public Result<IPage<MaterialVO>> publicList(
            @RequestParam(defaultValue = "1") Long current,
            @RequestParam(defaultValue = "20") Long size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long tagId,
            @RequestParam(required = false) String sort) {
        Page<Material> page = new Page<>(current, size);
        return Result.success(materialService.page(page, keyword, categoryId, tagId, null, sort));
    }

    @GetMapping("/public/{id}")
    public Result<MaterialVO> publicGetById(@PathVariable Long id) {
        materialService.incrementViewCount(id);
        return Result.success(materialService.getById(id));
    }

    @GetMapping("/my")
    public Result<IPage<MaterialVO>> myMaterials(
            @RequestParam(defaultValue = "1") Long current,
            @RequestParam(defaultValue = "20") Long size,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Page<Material> page = new Page<>(current, size);
        return Result.success(materialService.page(page, null, null, null, userId, null));
    }

    @PostMapping("/upload")
    public Result<MaterialVO> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("data") String data,
            HttpServletRequest request) throws Exception {
        Long userId = (Long) request.getAttribute("userId");
        MaterialUploadDTO dto = objectMapper.readValue(data, MaterialUploadDTO.class);
        return Result.success(materialService.upload(file, dto, userId));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        materialService.delete(id, userId);
        return Result.success();
    }

    @PostMapping("/{id}/favorite")
    public Result<Boolean> toggleFavorite(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        boolean isFavorited = favoriteService.isFavorited(userId, id, null, 1);
        favoriteService.toggleFavorite(userId, id, null, 1);
        materialService.incrementFavoriteCount(id, !isFavorited);
        return Result.success(!isFavorited);
    }

    @GetMapping("/{id}/favorite-status")
    public Result<Boolean> getFavoriteStatus(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return Result.success(favoriteService.isFavorited(userId, id, null, 1));
    }

    @PostMapping("/{id}/download")
    public Result<Void> download(@PathVariable Long id) {
        materialService.incrementDownloadCount(id);
        return Result.success();
    }
}
