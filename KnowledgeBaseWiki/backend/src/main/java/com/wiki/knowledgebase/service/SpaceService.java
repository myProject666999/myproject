package com.wiki.knowledgebase.service;

import com.wiki.knowledgebase.entity.Space;
import com.wiki.knowledgebase.entity.SpaceMember;
import com.wiki.knowledgebase.repository.SpaceMemberRepository;
import com.wiki.knowledgebase.repository.SpaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SpaceService {

    private final SpaceRepository spaceRepository;
    private final SpaceMemberRepository spaceMemberRepository;

    public List<Space> getPublicSpaces() {
        return spaceRepository.findByStatusAndIsPublicOrderByCreatedAtDesc(1, 1);
    }

    public List<Space> getUserSpaces(Long userId) {
        return spaceRepository.findMemberSpaces(userId);
    }

    public Optional<Space> getById(Long id) {
        return spaceRepository.findById(id);
    }

    @Transactional
    public Space createSpace(Space space, Long userId) {
        space.setOwnerId(userId);
        space.setStatus(1);
        Space saved = spaceRepository.save(space);

        SpaceMember member = new SpaceMember();
        member.setSpaceId(saved.getId());
        member.setUserId(userId);
        member.setRole("owner");
        spaceMemberRepository.save(member);

        return saved;
    }

    @Transactional
    public Space updateSpace(Long id, Space space) {
        Space existing = spaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("空间不存在"));
        existing.setName(space.getName());
        existing.setDescription(space.getDescription());
        existing.setIcon(space.getIcon());
        existing.setColor(space.getColor());
        existing.setIsPublic(space.getIsPublic());
        return spaceRepository.save(existing);
    }

    @Transactional
    public void deleteSpace(Long id) {
        Space space = spaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("空间不存在"));
        space.setStatus(0);
        spaceRepository.save(space);
    }

    public List<SpaceMember> getMembers(Long spaceId) {
        return spaceMemberRepository.findBySpaceId(spaceId);
    }

    @Transactional
    public SpaceMember addMember(Long spaceId, Long userId, String role) {
        SpaceMember member = new SpaceMember();
        member.setSpaceId(spaceId);
        member.setUserId(userId);
        member.setRole(role);
        return spaceMemberRepository.save(member);
    }

    @Transactional
    public void removeMember(Long spaceId, Long userId) {
        spaceMemberRepository.deleteBySpaceIdAndUserId(spaceId, userId);
    }

    public boolean hasPermission(Long spaceId, Long userId, String requiredRole) {
        if (userId == null) {
            return false;
        }
        Optional<SpaceMember> member = spaceMemberRepository.findBySpaceIdAndUserId(spaceId, userId);
        if (member.isEmpty()) {
            return false;
        }
        String role = member.get().getRole();
        return switch (requiredRole) {
            case "owner" -> "owner".equals(role);
            case "admin" -> "owner".equals(role) || "admin".equals(role);
            case "editor" -> "owner".equals(role) || "admin".equals(role) || "editor".equals(role);
            case "viewer" -> true;
            default -> false;
        };
    }
}
