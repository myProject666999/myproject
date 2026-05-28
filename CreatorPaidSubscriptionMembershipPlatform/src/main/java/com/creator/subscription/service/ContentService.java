package com.creator.subscription.service;

import com.creator.subscription.dto.ContentDTO;
import com.creator.subscription.entity.Content;
import com.creator.subscription.repository.ContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ContentService {

    private final ContentRepository contentRepository;
    private final SubscriptionService subscriptionService;

    @Transactional
    public Content createContent(ContentDTO dto) {
        Content content = new Content();
        content.setCreatorId(dto.getCreatorId());
        content.setTitle(dto.getTitle());
        content.setContentType(dto.getContentType());
        content.setContent(dto.getContent());
        content.setMediaUrls(dto.getMediaUrls());
        content.setThumbnailUrl(dto.getThumbnailUrl());
        content.setMinTierLevel(dto.getMinTierLevel() != null ? dto.getMinTierLevel() : 0);
        content.setIsPublished(1);
        return contentRepository.save(content);
    }

    @Transactional
    public Content updateContent(Long contentId, ContentDTO dto) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("内容不存在"));

        if (dto.getTitle() != null) {
            content.setTitle(dto.getTitle());
        }
        if (dto.getContentType() != null) {
            content.setContentType(dto.getContentType());
        }
        if (dto.getContent() != null) {
            content.setContent(dto.getContent());
        }
        if (dto.getMediaUrls() != null) {
            content.setMediaUrls(dto.getMediaUrls());
        }
        if (dto.getThumbnailUrl() != null) {
            content.setThumbnailUrl(dto.getThumbnailUrl());
        }
        if (dto.getMinTierLevel() != null) {
            content.setMinTierLevel(dto.getMinTierLevel());
        }

        return contentRepository.save(content);
    }

    public Optional<Content> getContent(Long contentId) {
        return contentRepository.findById(contentId);
    }

    public Page<Content> getCreatorContents(Long creatorId, Pageable pageable) {
        return contentRepository.findByCreatorIdAndIsPublishedOrderByCreatedAtDesc(creatorId, 1, pageable);
    }

    public Page<Content> getAccessibleContents(Long creatorId, Long userId, Pageable pageable) {
        Integer userTierLevel = subscriptionService.getUserMaxTierLevel(userId, creatorId);
        if (userTierLevel == null) {
            userTierLevel = 0;
        }
        return contentRepository.findAccessibleContents(creatorId, userTierLevel, pageable);
    }

    public List<Content> getAccessibleContentsList(Long creatorId, Long userId) {
        Integer userTierLevel = subscriptionService.getUserMaxTierLevel(userId, creatorId);
        if (userTierLevel == null) {
            userTierLevel = 0;
        }
        return contentRepository.findAccessibleContentsList(creatorId, userTierLevel);
    }

    public boolean canAccessContent(Long contentId, Long userId) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("内容不存在"));

        if (content.getMinTierLevel() == 0) {
            return true;
        }

        Integer userTierLevel = subscriptionService.getUserMaxTierLevel(userId, content.getCreatorId());
        return userTierLevel != null && userTierLevel >= content.getMinTierLevel();
    }

    @Transactional
    public void incrementViewCount(Long contentId) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("内容不存在"));
        content.setViewCount(content.getViewCount() + 1);
        contentRepository.save(content);
    }

    @Transactional
    public void deleteContent(Long contentId) {
        contentRepository.deleteById(contentId);
    }

    public long countCreatorPublishedContents(Long creatorId) {
        return contentRepository.countByCreatorIdAndIsPublished(creatorId, 1);
    }
}
