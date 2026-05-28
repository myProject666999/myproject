package com.school.cafeteria.repository;

import com.school.cafeteria.entity.ParentFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParentFeedbackRepository extends JpaRepository<ParentFeedback, Long> {

    List<ParentFeedback> findByParentId(Long parentId);

    List<ParentFeedback> findByStatus(String status);

    List<ParentFeedback> findByFeedbackType(String feedbackType);

    List<ParentFeedback> findByIsPublic(Integer isPublic);

    @Query("SELECT COUNT(p) FROM ParentFeedback p WHERE p.status = :status")
    Long countByStatus(@Param("status") String status);
}
