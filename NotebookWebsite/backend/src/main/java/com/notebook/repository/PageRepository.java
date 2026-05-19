package com.notebook.repository;

import com.notebook.entity.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PageRepository extends JpaRepository<Page, Long> {
    List<Page> findBySectionIdOrderBySortOrderAsc(Long sectionId);
    List<Page> findByIsFavoriteTrueOrderByUpdatedAtDesc();
    
    @Query(value = "SELECT * FROM pages WHERE MATCH(title, content) AGAINST(:keyword IN NATURAL LANGUAGE MODE)", nativeQuery = true)
    List<Page> searchByKeyword(@Param("keyword") String keyword);
}
