package com.emojipack.service;

import com.emojipack.dto.MaterialUploadDTO;
import com.emojipack.entity.Material;
import com.emojipack.vo.MaterialVO;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.web.multipart.MultipartFile;

public interface MaterialService {

    IPage<MaterialVO> page(Page<Material> page, String keyword, Long categoryId, Long tagId, Long uploaderId, String sort);

    MaterialVO getById(Long id);

    MaterialVO upload(MultipartFile file, MaterialUploadDTO dto, Long userId);

    void incrementViewCount(Long id);

    void incrementDownloadCount(Long id);

    void incrementFavoriteCount(Long id, boolean isFavorited);

    void delete(Long id, Long userId);
}
