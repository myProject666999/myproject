package com.wiki.knowledgebase.repository;

import com.wiki.knowledgebase.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findBySpaceIdAndParentIdAndStatusOrderBySortOrderAsc(Long spaceId, Long parentId, Integer status);

    List<Document> findBySpaceIdAndStatusOrderByDepthAscSortOrderAsc(Long spaceId, Integer status);

    Optional<Document> findByIdAndStatus(Long id, Integer status);

    List<Document> findByStatusOrderByUpdatedAtDesc(Integer status);

    @Query(value = "SELECT * FROM documents WHERE MATCH(title, content) AGAINST(:keyword IN NATURAL LANGUAGE MODE) AND status = 1", nativeQuery = true)
    List<Document> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT d FROM Document d WHERE d.spaceId = :spaceId AND d.status = 0 ORDER BY d.deletedAt DESC")
    List<Document> findRecycledBySpaceId(@Param("spaceId") Long spaceId);
}
