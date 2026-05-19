package com.notebook.repository;

import com.notebook.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {
    List<Section> findByNotebookIdOrderBySortOrderAsc(Long notebookId);
    List<Section> findByParentIdOrderBySortOrderAsc(Long parentId);
    List<Section> findByNotebookIdAndParentIdIsNullOrderBySortOrderAsc(Long notebookId);
}
