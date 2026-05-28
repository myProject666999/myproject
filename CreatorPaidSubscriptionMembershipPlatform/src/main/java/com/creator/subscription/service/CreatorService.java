package com.creator.subscription.service;

import com.creator.subscription.entity.Creator;
import com.creator.subscription.entity.MembershipTier;
import com.creator.subscription.repository.CreatorRepository;
import com.creator.subscription.repository.MembershipTierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CreatorService {

    private final CreatorRepository creatorRepository;
    private final MembershipTierRepository membershipTierRepository;

    @Transactional
    public Creator registerCreator(Long userId, String creatorName, String description) {
        if (creatorRepository.existsByUserId(userId)) {
            throw new RuntimeException("用户已是创作者");
        }

        Creator creator = new Creator();
        creator.setUserId(userId);
        creator.setCreatorName(creatorName);
        creator.setDescription(description);
        creator.setIsVerified(0);
        creator.setStatus(1);

        return creatorRepository.save(creator);
    }

    public Optional<Creator> getCreatorById(Long creatorId) {
        return creatorRepository.findById(creatorId);
    }

    public Optional<Creator> getCreatorByUserId(Long userId) {
        return creatorRepository.findByUserId(userId);
    }

    public Optional<Creator> getCreatorByName(String creatorName) {
        return creatorRepository.findByCreatorName(creatorName);
    }

    public List<Creator> searchCreators(String keyword) {
        return creatorRepository.findByCreatorNameContaining(keyword);
    }

    public List<Creator> getTopCreators() {
        return creatorRepository.findTopCreators();
    }

    @Transactional
    public Creator updateCreator(Long creatorId, Creator updateData) {
        Creator creator = creatorRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("创作者不存在"));

        if (updateData.getCreatorName() != null) {
            creator.setCreatorName(updateData.getCreatorName());
        }
        if (updateData.getCoverImage() != null) {
            creator.setCoverImage(updateData.getCoverImage());
        }
        if (updateData.getDescription() != null) {
            creator.setDescription(updateData.getDescription());
        }

        return creatorRepository.save(creator);
    }

    public List<MembershipTier> getCreatorTiers(Long creatorId) {
        return membershipTierRepository.findByCreatorIdAndIsActiveOrderByTierLevelAsc(creatorId, 1);
    }

    public List<MembershipTier> getAllCreatorTiers(Long creatorId) {
        return membershipTierRepository.findByCreatorIdOrderByTierLevelAsc(creatorId);
    }

    @Transactional
    public MembershipTier createTier(MembershipTier tier) {
        return membershipTierRepository.save(tier);
    }

    @Transactional
    public MembershipTier updateTier(Long tierId, MembershipTier updateData) {
        MembershipTier tier = membershipTierRepository.findById(tierId)
                .orElseThrow(() -> new RuntimeException("会员等级不存在"));

        if (updateData.getTierName() != null) {
            tier.setTierName(updateData.getTierName());
        }
        if (updateData.getTierLevel() != null) {
            tier.setTierLevel(updateData.getTierLevel());
        }
        if (updateData.getPrice() != null) {
            tier.setPrice(updateData.getPrice());
        }
        if (updateData.getDescription() != null) {
            tier.setDescription(updateData.getDescription());
        }
        if (updateData.getBenefits() != null) {
            tier.setBenefits(updateData.getBenefits());
        }
        if (updateData.getDiscordRole() != null) {
            tier.setDiscordRole(updateData.getDiscordRole());
        }
        if (updateData.getIsActive() != null) {
            tier.setIsActive(updateData.getIsActive());
        }

        return membershipTierRepository.save(tier);
    }

    @Transactional
    public void deleteTier(Long tierId) {
        MembershipTier tier = membershipTierRepository.findById(tierId)
                .orElseThrow(() -> new RuntimeException("会员等级不存在"));
        tier.setIsActive(0);
        membershipTierRepository.save(tier);
    }
}
