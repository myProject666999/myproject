package com.school.cafeteria.repository;

import com.school.cafeteria.entity.Rectification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RectificationRepository extends JpaRepository<Rectification, Long> {

    Optional<Rectification> findByInspectionId(Long inspectionId);
}
