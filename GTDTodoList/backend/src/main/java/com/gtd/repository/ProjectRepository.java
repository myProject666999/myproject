package com.gtd.repository;

import com.gtd.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByUserIdAndIsArchivedFalseOrderBySortOrderAscCreatedAtDesc(Long userId);
    List<Project> findByUserIdOrderBySortOrderAscCreatedAtDesc(Long userId);
}
