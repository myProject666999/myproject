package com.paper.repository;

import com.paper.entity.Paper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaperRepository extends JpaRepository<Paper, Long> {
    Page<Paper> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);

    @Query("SELECT p FROM Paper p JOIN p.tags t WHERE t.id = :tagId")
    Page<Paper> findByTagId(@Param("tagId") Long tagId, Pageable pageable);

    @Query("SELECT p FROM Paper p JOIN p.tags t WHERE t.id = :tagId AND LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Paper> findByTagIdAndTitleContaining(@Param("tagId") Long tagId, @Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT p FROM Paper p WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.authors) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Paper> search(@Param("keyword") String keyword, Pageable pageable);

    List<Paper> findByIdIn(List<Long> ids);
}
