package com.emojipack.controller;

import com.emojipack.common.Result;
import com.emojipack.dto.CollectionCreateDTO;
import com.emojipack.entity.Collection;
import com.emojipack.service.CollectionService;
import com.emojipack.service.FavoriteService;
import com.emojipack.vo.CollectionVO;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/collections")
@RequiredArgsConstructor
public class CollectionController {

    private final CollectionService collectionService;
    private final FavoriteService favoriteService;

    @GetMapping("/public/list")
    public Result<IPage<CollectionVO>> publicList(
            @RequestParam(defaultValue = "1") Long current,
            @RequestParam(defaultValue = "20") Long size,
            @RequestParam(required = false) String keyword) {
        Page<Collection> page = new Page<>(current, size);
        return Result.success(collectionService.page(page, keyword, null, 1));
    }

    @GetMapping("/public/{id}")
    public Result<CollectionVO> publicGetById(@PathVariable Long id) {
        return Result.success(collectionService.getById(id));
    }

    @GetMapping("/my")
    public Result<IPage<CollectionVO>> myCollections(
            @RequestParam(defaultValue = "1") Long current,
            @RequestParam(defaultValue = "20") Long size,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Page<Collection> page = new Page<>(current, size);
        return Result.success(collectionService.page(page, null, userId, null));
    }

    @PostMapping
    public Result<CollectionVO> create(@Valid @RequestBody CollectionCreateDTO dto, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return Result.success(collectionService.create(dto, userId));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        collectionService.delete(id, userId);
        return Result.success();
    }

    @PostMapping("/{id}/materials/{materialId}")
    public Result<Void> addMaterial(@PathVariable Long id, @PathVariable Long materialId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        collectionService.addMaterial(id, materialId, userId);
        return Result.success();
    }

    @DeleteMapping("/{id}/materials/{materialId}")
    public Result<Void> removeMaterial(@PathVariable Long id, @PathVariable Long materialId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        collectionService.removeMaterial(id, materialId, userId);
        return Result.success();
    }

    @PostMapping("/{id}/favorite")
    public Result<Boolean> toggleFavorite(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        boolean isFavorited = favoriteService.isFavorited(userId, null, id, 2);
        favoriteService.toggleFavorite(userId, null, id, 2);
        return Result.success(!isFavorited);
    }
}
