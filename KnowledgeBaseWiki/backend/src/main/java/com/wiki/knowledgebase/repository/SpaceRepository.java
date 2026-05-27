package com.wiki.knowledgebase.repository;

import com.wiki.knowledgebase.entity.Space;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpaceRepository extends JpaRepository<Space, Long> {

    List<Space> findByStatusAndIsPublicOrderByCreatedAtDesc(Integer status, Integer isPublic);

    @Query("SELECT s FROM Space s WHERE s.ownerId = :userId AND s.status = 1 ORDER BY s.createdAt DESC")
    List<Space> findByOwnerId(@Param("userId") Long userId);

    @Query("SELECT s FROM Space s JOIN SpaceMember sm ON s.id = sm.spaceId WHERE sm.userId = :userId AND s.status = 1 ORDER BY s.createdAt DESC")
    List<Space> findMemberSpaces(@Param("userId") Long userId);
}
